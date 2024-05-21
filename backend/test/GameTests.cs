using System.Diagnostics.CodeAnalysis;

namespace Tests;

[TestClass]
public class GameTests
{
    class TestSetup
    {
        public Galaxy Galaxy;
        public List<InGamePlayer> Players;

        public TestSetup()
        {
            Galaxy = new();
            Players = new();
            for (int i = 0; i < 4; i++)
            {
                InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
                Players.Add(player);
                Api.FindGame(player.Name, player.Id, player.Token, Galaxy, false);
            }
        }
    }

    [TestMethod]
    public void Game_TypingIgnoredBeforeGameStart()
    {
        TestSetup test = new();

        test.Galaxy.ClearOutbox();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];

        // Ignored before game starts
        Api.TypeWord(TH.KeystrokesForWord(game.Phrase, 0), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(0, game.Players[0].PhraseIndex);

        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        // Works now
        Api.TypeWord(TH.KeystrokesForWord(game.Phrase, 0), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(1, game.Players[0].PhraseIndex);
    }

    [TestMethod]
    public void Game_CompletingPhraseEndsGame()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        TH.TypeWholePhrase(test.Galaxy, game, test.Players[0]);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[1]);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[2]);

        Assert.AreEqual(Game.GameState.Running, game.State);

        var ks = TH.Keystrokes(game.Phrase);
        Api.TypeWord(ks.GetRange(0, ks.Count - 1), test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(Game.GameState.Running, game.State);
        Api.TypeWord(ks.GetRange(ks.Count - 1, 1), test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_PlayerFinishingSendsEvent()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        var ks = TH.Keystrokes(game.Phrase);
        Api.TypeWord(ks.GetRange(0, ks.Count - 1), test.Players[0].Id, test.Galaxy);
        test.Galaxy.ClearOutbox();
        Api.TypeWord(ks.GetRange(ks.Count - 1, 1), test.Players[0].Id, test.Galaxy);

        Assert.AreEqual(8, test.Galaxy.OutboxCount());
        Assert.AreEqual(4, test.Galaxy.OutboxMessages().Where((m) => m.PlayerCompleted != null).Count());
        PlayerCompleted[] playerCompletedMessages =
            test.Galaxy.OutboxMessages().Where((m) => m.PlayerCompleted != null).Select((m) => m.PlayerCompleted).ToArray();
        Assert.IsTrue(playerCompletedMessages.All((m) => m.PlayerId == test.Players[0].Id));
        Assert.IsTrue(playerCompletedMessages.All((m) => m.Place == 0));
        Assert.AreEqual(2, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(2, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(2, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(2, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[3].Id).Count());
        Assert.AreEqual(Game.GameState.Running, game.State);
    }

    [TestMethod]
    public void Game_AggregatesKeyStrokes()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        float time = Game.CountdownDuration + .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();

        InGamePlayer player = test.Galaxy.ActiveGames.Values.First().Players.Find(p => p.Id == test.Players[0].Id)!;
        string word1 = game.Phrase.Split(' ')[0];
        var keystrokes = TH.KeystrokesForWord(game.Phrase, 0, 30);
        Api.TypeWord(keystrokes, test.Players[0].Id, test.Galaxy);
        TH.AssertKeystrokesMatchStr(player.KeyStrokes, word1);

        string word2 = game.Phrase.Split(' ')[1];
        keystrokes = TH.KeystrokesForWord(game.Phrase, 1, 30);
        Api.TypeWord(keystrokes, test.Players[0].Id, test.Galaxy);
        TH.AssertKeystrokesMatchStr(player.KeyStrokes, word1 + " " + word2);
    }

    [TestMethod]
    public void Game_SendsWpmStatsAboutPlayersWhenTheyFinish()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[0], 42);

        List<PlayerCompleted> playerCompleteds = TH.GetUpdatesOfType<PlayerCompleted>(test.Galaxy);
        Assert.AreEqual(4, playerCompleteds.Length);
        Assert.AreEqual(Stats.GetWpm(player.KeyStrokes), playerCompleteds[0].Wpm);
        Assert.IsTrue(playerCompleteds[0].RawWpmBySecond.Count > 0);
        Assert.IsTrue(playerCompleteds[0].WpmBySecond.Count > 0);
        CollectionAssert.AreEqual(
            Stats.GetRawWpmBySecond(player.KeyStrokes),
            playerCompleteds[0].RawWpmBySecond);
        CollectionAssert.AreEqual(
            Stats.GetAggWpmBySecond(player.KeyStrokes),
            playerCompleteds[0].WpmBySecond);
    }

    [TestMethod]
    public void Game_WhenAllPlayersFinish()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            string word = game.Words[i];
            Api.TypeWord(word, new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
            Api.TypeWord(word, new List<KeyStroke>(), test.Players[1].Id, test.Galaxy);
            Api.TypeWord(word, new List<KeyStroke>(), test.Players[2].Id, test.Galaxy);
            Api.TypeWord(word, new List<KeyStroke>(), test.Players[3].Id, test.Galaxy);
        }

        Api.TypeWord(game.Words[^1], new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
        Api.TypeWord(game.Words[^1], new List<KeyStroke>(), test.Players[1].Id, test.Galaxy);
        Api.TypeWord(game.Words[^1], new List<KeyStroke>(), test.Players[2].Id, test.Galaxy);
        test.Galaxy.ClearOutbox();

        Api.TypeWord(game.Words[^1], new List<KeyStroke>(), test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.OutboxMessages().Where((m) => m.PlayerCompleted != null).Count());
        Assert.AreEqual(4, test.Galaxy.OutboxMessages().Where((m) => m.GameOver != null).Count());
        Assert.AreEqual(4, test.Galaxy.OutboxMessages().Where((m) => m.WordFinished != null).Count());
        Assert.AreEqual(3, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(3, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(3, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(3, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[3].Id).Count());
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_SendsUpdateWhenAnyPlayerFinishesWord()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        test.Galaxy.ClearOutbox();
        Api.TypeWord(game.Words[0], new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.OutboxCount());
        Assert.IsTrue(test.Galaxy.OutboxMessages().All((m) => m.WordFinished != null));
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[3].Id).Count());
        Assert.IsTrue(test.Galaxy.OutboxMessages().All((m) => m.WordFinished.PlayerId == test.Players[0].Id));
        Assert.IsTrue(
            test.Galaxy.OutboxMessages().All(m => m.WordFinished.PercentComplete == 1f / (float)game.Words.Length));
    }

    [TestMethod]
    public void Game_HasCorrectState()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Game game = galaxy.OpenGames[0];
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Bob", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Api.FindGame("Akshay", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Petunia", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        galaxy.Time.Update(Game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        galaxy.Time.Update(Game.CountdownDuration + .1f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Running, game.State);

        // TODO: Game end
    }

    [TestMethod]
    public void Phrases_ParsesPhrase()
    {
        CollectionAssert.AreEqual(
            Phrases.GetWords("The world is just so beautiful."),
            new string[] { "The", "world", "is", "just", "so", "beautiful." }
        );
    }

    [TestMethod]
    public void Game_FinishingWordSendsVelocityAndPosition()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();
        test.Galaxy.ClearOutbox();

        Api.TypeWord(game.Words[0], new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.OutboxCount());
        Assert.IsTrue(test.Galaxy.OutboxMessages().All((m) => m.WordFinished != null));
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Where((m) => m.RecipientId == test.Players[3].Id).Count());
        Assert.IsTrue(test.Galaxy.OutboxMessages().All((m) => m.WordFinished.PlayerId == test.Players[0].Id));
        float percentComplete = 1 / (float)game.Words.Length;
        float expectedVelocity = Game.CalculateVelocity_km_s(percentComplete);
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => m.WordFinished.PercentComplete == percentComplete));
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => m.WordFinished.VelocityKmS == expectedVelocity));
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => m.WordFinished.PositionKm == 0)); // No time updates

        test.Galaxy.Time.Update(Game.CountdownDuration + .2f);
        test.Galaxy.Update();
        test.Galaxy.ClearOutbox();
        float expectedPosition = expectedVelocity * .1f;
        AssertExtensions.IsApproximately(expectedPosition, game.Players[0].PositionKm);
        Assert.AreEqual(0, game.Players[1].PositionKm);
        Assert.AreEqual(0, game.Players[2].PositionKm);
        Assert.AreEqual(0, game.Players[3].PositionKm);

        Api.TypeWord(game.Words[1], new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.OutboxCount());
        Assert.IsTrue(test.Galaxy.OutboxMessages().All((m) => m.WordFinished != null));
        percentComplete = 2 / (float)game.Words.Length;
        expectedVelocity = Game.CalculateVelocity_km_s(percentComplete);
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => m.WordFinished.PercentComplete == percentComplete));
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => m.WordFinished.VelocityKmS == expectedVelocity));
        Assert.IsTrue(test.Galaxy.OutboxMessages().All(m => AssertExtensions.ApproximatelyEqual(m.WordFinished.PositionKm, expectedPosition)));
    }

    [TestMethod]
    public void Game_HasReasonablePhrase()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Game game = galaxy.OpenGames[0];
        Assert.IsTrue(game.Words.Length > 20);
        Assert.IsTrue(game.Words.Length < 40);
    }

    [TestMethod]
    public void Game_SendsGameIdInMessages()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Api.FindGame("George", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Game game = galaxy.OpenGames[0];
        InGamePlayer alice = game.Players[0];
        Assert.AreEqual(2, galaxy.OutboxMessages().Count(m => m.RecipientId == alice.Id));
        Assert.AreEqual(3, galaxy.OutboxMessages().Count(m => m.GameId == game.Id));
        Api.DisconnectPlayer(alice.Id, galaxy);
        galaxy.ClearOutbox();

        Api.FindGame(alice.Name, alice.Id, alice.Token, galaxy, false, new HashSet<GameMode> { GameMode.HomeRow });
        Game newGame = galaxy.OpenGames[^1];
        Assert.AreEqual(1, galaxy.OutboxMessages().Count(m => m.GameId == newGame.Id));
        Assert.AreEqual(1, galaxy.OutboxMessages().Count(m => m.RecipientId == alice.Id));
    }

    [TestMethod]
    public void Game_DoesntSendMessagesToPlayersNotInGame()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Api.FindGame("George", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Api.FindGame("Alex", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Api.FindGame("Ava", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Game game = galaxy.ActiveGames.Values.First();
        InGamePlayer alice = game.Players[0];
        Api.FindGame(alice.Name, alice.Id, alice.Token, galaxy, false, new HashSet<GameMode> { GameMode.HomeRow });
        galaxy.ClearOutbox();

        galaxy.Time.Update(Game.CountdownDuration + .1f);
        galaxy.Update();
        Assert.AreEqual(0, galaxy.OutboxMessages().Count(m => m.RecipientId == alice.Id));
    }

    [TestMethod]
    public void Game_Accuracy()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        var keystrokes = StatsTests.GetKeyStrokesToCompletePhrase(game.Words[0] + " ");
        keystrokes.Insert(keystrokes.Count / 2, new KeyStroke { Character = "f", Time = 0.2f });
        keystrokes.Insert(keystrokes.Count / 2, new KeyStroke { Character = "\b", Time = 0.3f });

        Api.TypeWord(game.Words[0], keystrokes, test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(1, game.Players[0].PhraseIndex);
        Assert.AreEqual(1, game.Players[0].Errors);

        for (int i = 1; i < game.Words.Length; i++)
        {
            Api.TypeWord(game.Words[i], new List<KeyStroke>(), test.Players[0].Id, test.Galaxy);
        }

        var playerCompletedMessage = test.Galaxy.OutboxMessages().First(m => m.PlayerCompleted != null).PlayerCompleted;
        Assert.AreEqual(game.Phrase.Length / ((float)game.Phrase.Length + 1), playerCompletedMessage.Accuracy);
    }
}