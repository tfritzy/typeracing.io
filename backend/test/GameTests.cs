using System.Diagnostics.CodeAnalysis;
using Schema;

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
            Galaxy.Time.Update(42); // Make sure time checks are relative to game start
            for (int i = 0; i < 4; i++)
            {
                Api.FindGame($"Player {i}", IdGen.NewPlayerId(), IdGen.NewToken(), Galaxy, false);
            }
            Players = Galaxy.ActiveGames.Values.First().Players;
        }
    }

    [TestMethod]
    public void Game_TypingIgnoredBeforeGameStart()
    {
        TestSetup test = new();

        test.Galaxy.ClearOutbox();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];

        // Ignored before game starts
        Api.TypeWord(TH.KeystrokesForWord(game.Phrase, 0), test.Players[0], test.Galaxy);
        Assert.AreEqual(0, game.Players[0].PhraseIndex);

        test.Galaxy.Time.Add(game.CountdownDuration + .1f);
        test.Galaxy.Update();

        // Works now
        var ks = TH.KeystrokesForWord(game.Phrase, 0);
        Api.TypeWord(ks, test.Players[0], test.Galaxy);
        Assert.AreEqual(ks.Count, game.Players[0].PhraseIndex);
    }

    [TestMethod]
    public void Game_CompletingPhraseEndsGame()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);

        TH.TypeWholePhrase(test.Galaxy, game, test.Players[0]);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[1]);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[2]);

        Assert.AreEqual(Game.GameState.Running, game.State);

        var ks = TH.Keystrokes(game.Phrase);
        Api.TypeWord(ks.GetRange(0, ks.Count - 1), test.Players[3], test.Galaxy);
        Assert.AreEqual(Game.GameState.Running, game.State);
        Api.TypeWord(ks.GetRange(ks.Count - 1, 1), test.Players[3], test.Galaxy);
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_PlayerFinishingSendsEvent()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Add(game.CountdownDuration + .1f);
        test.Galaxy.Update();

        var ks = TH.Keystrokes(game.Phrase);
        Api.TypeWord(ks.GetRange(0, ks.Count - 1), test.Players[0], test.Galaxy);
        test.Galaxy.ClearOutbox();
        Api.TypeWord(ks.GetRange(ks.Count - 1, 1), test.Players[0], test.Galaxy);

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
        float time = game.CountdownDuration + .1f;
        test.Galaxy.Time.Add(time);
        test.Galaxy.Update();

        InGamePlayer player = test.Galaxy.ActiveGames.Values.First().Players.Find(p => p.Id == test.Players[0].Id)!;
        string word1 = game.Phrase.Split(' ')[0] + " ";
        var keystrokes = TH.KeystrokesForWord(game.Phrase, 0, 30);
        Api.TypeWord(keystrokes, test.Players[0], test.Galaxy);
        TH.AssertKeystrokesMatchStr(player.KeyStrokes, word1);

        string word2 = game.Phrase.Split(' ')[1] + " ";
        keystrokes = TH.KeystrokesForWord(game.Phrase, 1, 30);
        Api.TypeWord(keystrokes, test.Players[0], test.Galaxy);
        TH.AssertKeystrokesMatchStr(player.KeyStrokes, word1 + word2);
    }

    [TestMethod]
    public void Game_SendsStatsAboutPlayersWhenTheyFinish()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[0], 42);

        var playerCompleteds = TH.GetUpdatesOfType(test.Galaxy, OneofUpdate.UpdateOneofCase.PlayerCompleted);
        Assert.AreEqual(4, playerCompleteds.Count);
        Assert.AreEqual(Stats.GetWpm(test.Players[0].KeyStrokes), playerCompleteds[0].PlayerCompleted.Wpm);
        Assert.IsTrue(playerCompleteds[0].PlayerCompleted.RawWpmBySecond.Count > 0);
        Assert.IsTrue(playerCompleteds[0].PlayerCompleted.WpmBySecond.Count > 0);
        CollectionAssert.AreEqual(
            Stats.GetRawWpmBySecond(test.Players[0].KeyStrokes),
            playerCompleteds[0].PlayerCompleted.RawWpmBySecond);
        CollectionAssert.AreEqual(
            Stats.GetAggWpmBySecond(test.Players[0].KeyStrokes),
            playerCompleteds[0].PlayerCompleted.WpmBySecond);
        TH.AssertErrorCountsEqual(
            Stats.GetErrorCountByTime(test.Players[0].KeyStrokes, game.Phrase),
            playerCompleteds[0].PlayerCompleted.ErrorsAtTime.ToList()
        );
    }

    [TestMethod]
    public void Game_WhenAllPlayersFinish()
    {
        TestSetup test = new();
        Game game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);

        var keystrokes = TH.Keystrokes(game.Phrase, 30);
        Api.TypeWord(keystrokes, test.Players[0], test.Galaxy);
        Api.TypeWord(keystrokes, test.Players[1], test.Galaxy);
        Api.TypeWord(keystrokes, test.Players[2], test.Galaxy);
        Api.TypeWord(keystrokes.GetRange(0, keystrokes.Count - 1), test.Players[3], test.Galaxy);
        test.Galaxy.ClearOutbox();

        Api.TypeWord(keystrokes.GetRange(keystrokes.Count - 1, 1), test.Players[3], test.Galaxy);
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
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);
        test.Galaxy.ClearOutbox();

        var ks = TH.KeystrokesForWord(game.Phrase, 0);
        Api.TypeWord(ks, test.Players[0], test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.OutboxCount());
        var wordFinisheds = TH.GetUpdatesOfType(test.Galaxy, OneofUpdate.UpdateOneofCase.WordFinished);
        Assert.AreEqual(test.Galaxy.OutboxCount(), wordFinisheds.Count);
        Assert.AreEqual(4, wordFinisheds.Count);
        Assert.AreEqual(1, wordFinisheds.Where((m) => m.RecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(1, wordFinisheds.Where((m) => m.RecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(1, wordFinisheds.Where((m) => m.RecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(1, wordFinisheds.Where((m) => m.RecipientId == test.Players[3].Id).Count());
        Assert.IsTrue(wordFinisheds.All((m) => m.WordFinished.PlayerId == test.Players[0].Id));
        Assert.IsTrue(wordFinisheds.All(m => m.WordFinished.PercentComplete == (float)ks.Count / game.Phrase.Length));
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
        galaxy.Time.Add(game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        galaxy.Time.Add(.2f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Running, game.State);

        TH.TypeWholePhrase(galaxy, game, game.Players[0]);
        TH.TypeWholePhrase(galaxy, game, game.Players[1]);
        TH.TypeWholePhrase(galaxy, game, game.Players[2]);
        TH.TypeWholePhrase(galaxy, game, game.Players[3]);

        Assert.AreEqual(Game.GameState.Complete, game.State);
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

        galaxy.Time.Add(game.CountdownDuration + .1f);
        game.Update();

        Assert.AreEqual(0, galaxy.OutboxMessages().Count(m => m.RecipientId == alice.Id));
    }

    [TestMethod]
    public void Game_Accuracy()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);

        var ks = TH.KeystrokesForWord(game.Phrase, 0, 30);
        int insertPoint = ks.Count / 2;
        ks.Insert(insertPoint, new KeyStroke { Character = "f", Time = 0.2f });
        ks.Insert(insertPoint + 1, new KeyStroke { Character = "\b", Time = 0.3f });
        Api.TypeWord(ks, test.Players[0], test.Galaxy);
        Assert.AreEqual(ks.Count - 2, game.Players[0].PhraseIndex);
        Assert.AreEqual(1, game.Players[0].Errors);

        TH.TypeRemainderOfPhrase(test.Galaxy, game, test.Players[0], 30);
        var playerCompletedMessage = test.Galaxy.OutboxMessages().First(m => m.PlayerCompleted != null).PlayerCompleted;
        Assert.AreEqual(game.Phrase.Length / ((float)game.Phrase.Length + 1), playerCompletedMessage.Accuracy);
    }

    [TestMethod]
    public void Game_UpdatesPlayerLastSeen()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);

        Assert.AreEqual(42, test.Players[0].LastSeen);
        test.Galaxy.Time.Add(1);
        Assert.AreEqual(42, test.Players[0].LastSeen);
        Api.TypeWord(TH.KeystrokesForWord(game.Phrase, 0), test.Players[0], test.Galaxy);
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
        Assert.AreEqual(test.Galaxy.Time.Now, test.Players[0].LastSeen);
        Assert.AreEqual(42, test.Players[1].LastSeen);

        // Doesn't blow up on unknown player
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = "unknown" });
    }

    [TestMethod]
    public void Game_RemovesInactivePlayers()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);

        test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking - 1);
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
        test.Galaxy.Time.Add(2f);
        test.Galaxy.Update();
        Assert.AreEqual(3, game.Players.FindAll(p => p.IsDisconnected).Count);
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[1].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[2].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[3].Id));
    }

    [TestMethod]
    public void Game_DoesntRemoveBots()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Game game = galaxy.OpenGames[0];
        galaxy.Time.Add(Constants.TimeBeforeFillingBots + .1f);
        galaxy.Update();

        galaxy.Time.Add(Constants.InactiveTimeBeforeKicking + 1);
        galaxy.Update();

        Assert.AreEqual(1, game.Players.FindAll(p => p.IsDisconnected).Count);
    }

    [TestMethod]
    public void Game_PlayerDisconnectRecomputesGameFinished()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        TH.AdvancePastCooldown(test.Galaxy, game);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[0]);
        TH.TypeWholePhrase(test.Galaxy, game, test.Players[1]);
        Assert.AreEqual(Game.GameState.Running, game.State);
        test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking - 1);
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[1].Id });
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[2].Id });
        test.Galaxy.Time.Add(2f);
        test.Galaxy.Update();
        Assert.AreEqual(1, game.Players.FindAll(p => p.IsDisconnected).Count);
        Assert.AreEqual(Game.GameState.Running, game.State);
        test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking + 1);
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[1].Id });
        test.Galaxy.Update();
        Assert.AreEqual(Game.GameState.Complete, game.State);
        Assert.AreEqual(2, test.Galaxy.OutboxMessages().Count(m => m.GameOver != null));
    }

    [TestMethod]
    public void Game_DoesntDisconnectPlayerRepeatedly()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);

        for (int i = 0; i < 4; i++)
        {
            test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking + 1);
            test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
            test.Galaxy.Update();
        }

        Assert.AreEqual(3, game.Players.FindAll(p => p.IsDisconnected).Count);
        Assert.AreEqual(9, test.Galaxy.OutboxMessages().Count(m => m.PlayerDisconnected != null));
    }

    [TestMethod]
    public void Game_RemovedAfterPlayersGone()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);
        test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking + 1);
        test.Galaxy.Update();
        Assert.IsFalse(test.Galaxy.ActiveGames.ContainsKey(game.Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[0].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[1].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[2].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[3].Id));
    }

    [TestMethod]
    public void Game_RemovedIfLastsTooLong()
    {
        TestSetup test = new();
        var game = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);

        for (int i = 0; i < 10; i++)
        {
            test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking - 1);
            test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
            test.Galaxy.Update();
        }

        Assert.IsFalse(test.Galaxy.ActiveGames.ContainsKey(game.Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[0].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[1].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[2].Id));
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Players[3].Id));
    }

    [TestMethod]
    public void Game_DoesntAutoBootIfPlayerJoinsDifferentGame()
    {
        TestSetup test = new();
        Api.FindGame(test.Players[0].Name, test.Players[0].Id, test.Players[0].Token, test.Galaxy, false);
        Game secondGame = TH.FindGameOfPlayer(test.Galaxy, test.Players[0]);

        test.Galaxy.Time.Add(Constants.InactiveTimeBeforeKicking + 1);
        test.Galaxy.AddToInbox(new OneofRequest { SenderId = test.Players[0].Id });
        test.Galaxy.Update();

        Assert.AreEqual(1, test.Galaxy.ActiveGames.Count);
        Assert.AreEqual(4, test.Galaxy.PlayerGameMap.Count);
        Assert.IsTrue(test.Galaxy.PlayerGameMap.All(kvp => kvp.Value == secondGame.Id));
        Assert.AreEqual(secondGame.Id, test.Galaxy.PlayerGameMap[test.Players[0].Id]);
    }
}