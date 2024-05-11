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
                Api.FindGame(player.Name, player.Id, player.Token, Galaxy);
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
        Api.TypeWord(game.Words[0], new List<float>(), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(0, game.Players[0].WordIndex);

        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        // Works now
        Api.TypeWord(game.Words[0], new List<float>(), test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(1, game.Players[0].WordIndex);
    }

    [TestMethod]
    public void Game_CompletingPhraseEndsGame()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        foreach (string word in game.Words)
        {
            Api.TypeWord(word, new List<float>(), test.Players[0].Id, test.Galaxy);
            Api.TypeWord(word, new List<float>(), test.Players[1].Id, test.Galaxy);
            Api.TypeWord(word, new List<float>(), test.Players[2].Id, test.Galaxy);
        }

        Assert.AreEqual(Game.GameState.Running, game.State);

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            Api.TypeWord(game.Words[i], new List<float>(), test.Players[3].Id, test.Galaxy);
        }
        Assert.AreEqual(Game.GameState.Running, game.State);
        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_PlayerFinishingSendsEvent()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        test.Galaxy.Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            string word = game.Words[i];
            Api.TypeWord(word, new List<float>(), test.Players[0].Id, test.Galaxy);
        }

        test.Galaxy.ClearOutbox();
        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[0].Id, test.Galaxy);
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
    public void Game_AggregatesCharCompletionTimes()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        float time = Game.CountdownDuration + .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();

        InGamePlayer player = test.Galaxy.ActiveGames.Values.First().Players.Find(p => p.Id == test.Players[0].Id)!;
        Api.TypeWord(
            game.Words[0],
            new List<float>() { .1f, .4f, 1.2f },
            test.Players[0].Id,
            test.Galaxy);
        CollectionAssert.AreEqual(
            new float[] { .1f, .4f, 1.2f },
            player.CharCompletionTimes_s
        );

        Api.TypeWord(
            game.Words[1],
            new List<float>() { 1.5f, 1.8f, 1.9f },
            test.Players[0].Id,
            test.Galaxy);
        CollectionAssert.AreEqual(
            new float[] { .1f, .4f, 1.2f, 1.5f, 1.8f, 1.9f },
            player.CharCompletionTimes_s
        );
    }

    [TestMethod]
    public void Game_SendsWpmStatsAboutPlayersWhenTheyFinish()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        float time = Game.CountdownDuration + .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        List<float> charCompletionTimes = game.Phrase.Select((c, i) => (float)i / 100f).ToList();
        int charIndex = 0;
        for (int i = 0; i < game.Words.Length; i++)
        {
            int count = game.Words[i].Length + (i == game.Words.Length - 1 ? 0 : 1);
            Api.TypeWord(
                game.Words[i],
                charCompletionTimes.GetRange(charIndex, count),
                test.Players[0].Id,
                test.Galaxy);
            charIndex += game.Words[i].Length;
        }

        InGamePlayer player = test.Galaxy.ActiveGames.Values.First().Players.Find(p => p.Id == test.Players[0].Id)!;
        PlayerCompleted[] playerCompleteds = test.Galaxy.OutboxMessages().Where((m) => m.PlayerCompleted != null).Select((m) => m.PlayerCompleted).ToArray();
        Assert.AreEqual(4, playerCompleteds.Length);
        Assert.AreEqual(Stats.GetWpm(player.CharCompletionTimes_s), playerCompleteds[0].Wpm);
        Assert.IsTrue(playerCompleteds[0].RawWpmBySecond.Count > 0);
        Assert.IsTrue(playerCompleteds[0].WpmBySecond.Count > 0);
        CollectionAssert.AreEqual(
            Stats.GetRawWpmBySecond(player.CharCompletionTimes_s),
            playerCompleteds[0].RawWpmBySecond);
        CollectionAssert.AreEqual(
            Stats.GetAggWpmBySecond(player.CharCompletionTimes_s),
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
            Api.TypeWord(word, new List<float>(), test.Players[0].Id, test.Galaxy);
            Api.TypeWord(word, new List<float>(), test.Players[1].Id, test.Galaxy);
            Api.TypeWord(word, new List<float>(), test.Players[2].Id, test.Galaxy);
            Api.TypeWord(word, new List<float>(), test.Players[3].Id, test.Galaxy);
        }

        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[0].Id, test.Galaxy);
        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[1].Id, test.Galaxy);
        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[2].Id, test.Galaxy);
        test.Galaxy.ClearOutbox();

        Api.TypeWord(game.Words[^1], new List<float>(), test.Players[3].Id, test.Galaxy);
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
        Api.TypeWord(game.Words[0], new List<float>(), test.Players[0].Id, test.Galaxy);
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
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Bob", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy);
        Api.FindGame("Akshay", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy);
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Petunia", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy);
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

        Api.TypeWord(game.Words[0], new List<float>(), test.Players[0].Id, test.Galaxy);
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

        Api.TypeWord(game.Words[1], new List<float>(), test.Players[0].Id, test.Galaxy);
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
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.IsTrue(game.Words.Length > 20);
        Assert.IsTrue(game.Words.Length < 40);
    }
}