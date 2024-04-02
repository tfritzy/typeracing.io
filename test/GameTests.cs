namespace LightspeedTyping;

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
                InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId());
                Players.Add(player);
                Api.FindGame(player.Name, player.Id, Galaxy);
            }
        }
    }

    [TestMethod]
    public void Game_TypingIgnoredBeforeGameStart()
    {
        TestSetup test = new();

        test.Galaxy.Outbox.Clear();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];

        // Ignored before game starts
        Api.CompleteWord(game.Words[0], test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(0, game.Players[0].WordIndex);

        Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        // Works now
        Api.CompleteWord(game.Words[0], test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(1, game.Players[0].WordIndex);
    }

    [TestMethod]
    public void Game_CompletingPhraseEndsGame()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        foreach (string word in game.Words)
        {
            Api.CompleteWord(word, test.Players[0].Id, test.Galaxy);
            Api.CompleteWord(word, test.Players[1].Id, test.Galaxy);
            Api.CompleteWord(word, test.Players[2].Id, test.Galaxy);
        }

        Assert.AreEqual(Game.GameState.Running, game.State);

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            Api.CompleteWord(game.Words[i], test.Players[3].Id, test.Galaxy);
        }
        Assert.AreEqual(Game.GameState.Running, game.State);
        Api.CompleteWord(game.Words[^1], test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_PlayerFinishingSendsEvent()
    {
        TestSetup test = new();

        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            string word = game.Words[i];
            Api.CompleteWord(word, test.Players[0].Id, test.Galaxy);
        }

        test.Galaxy.Outbox.Clear();
        Api.CompleteWord(game.Words[^1], test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(7, test.Galaxy.Outbox.Count);
        Assert.AreEqual(4, test.Galaxy.Outbox.Where((Message m) => m is PlayerCompleted).Count());
        var playerCompletedMessages =
            test.Galaxy.Outbox.Where((Message m) => m is PlayerCompleted).Cast<PlayerCompleted>();
        Assert.IsTrue(playerCompletedMessages.All((Message m) => ((PlayerCompleted)m).PlayerId == test.Players[0].Id));
        Assert.IsTrue(playerCompletedMessages.All((Message m) => ((PlayerCompleted)m).Place == 1));
        Assert.AreEqual(1, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(2, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(2, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(2, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[3].Id).Count());
        Assert.AreEqual(Game.GameState.Running, game.State);
    }

    [TestMethod]
    public void Game_WhenAllPlayersFinish()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        for (int i = 0; i < game.Words.Length - 1; i++)
        {
            string word = game.Words[i];
            Api.CompleteWord(word, test.Players[0].Id, test.Galaxy);
            Api.CompleteWord(word, test.Players[1].Id, test.Galaxy);
            Api.CompleteWord(word, test.Players[2].Id, test.Galaxy);
            Api.CompleteWord(word, test.Players[3].Id, test.Galaxy);
        }

        Api.CompleteWord(game.Words[^1], test.Players[0].Id, test.Galaxy);
        Api.CompleteWord(game.Words[^1], test.Players[1].Id, test.Galaxy);
        Api.CompleteWord(game.Words[^1], test.Players[2].Id, test.Galaxy);
        test.Galaxy.Outbox.Clear();

        Api.CompleteWord(game.Words[^1], test.Players[3].Id, test.Galaxy);
        Assert.AreEqual(4, test.Galaxy.Outbox.Where((Message m) => m is PlayerCompleted).Count());
        Assert.AreEqual(4, test.Galaxy.Outbox.Where((Message m) => m is GameOver).Count());
        Assert.AreEqual(3, test.Galaxy.Outbox.Where((Message m) => m is WordFinished).Count());
        Assert.AreEqual(3, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[0].Id).Count());
        Assert.AreEqual(3, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(3, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(2, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[3].Id).Count());
        Assert.AreEqual(Game.GameState.Complete, game.State);
    }

    [TestMethod]
    public void Game_SendsUpdateWhenAnyPlayerFinishesWord()
    {
        TestSetup test = new();
        var game = test.Galaxy.ActiveGames[test.Galaxy.PlayerGameMap[test.Players[0].Id]];
        Time.Update(Game.CountdownDuration + .1f);
        test.Galaxy.Update();

        test.Galaxy.Outbox.Clear();
        Api.CompleteWord(game.Words[0], test.Players[0].Id, test.Galaxy);
        Assert.AreEqual(3, test.Galaxy.Outbox.Count);
        Assert.IsTrue(test.Galaxy.Outbox.All((Message m) => m is WordFinished));
        Assert.AreEqual(1, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[1].Id).Count());
        Assert.AreEqual(1, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[2].Id).Count());
        Assert.AreEqual(1, test.Galaxy.Outbox.Where((m) => m.SenderOrRecipientId == test.Players[3].Id).Count());
        Assert.IsTrue(test.Galaxy.Outbox.All((Message m) => ((WordFinished)m).PlayerId == test.Players[0].Id));
        Assert.IsTrue(
            test.Galaxy.Outbox.All((Message m) => ((WordFinished)m).PercentComplete == 1f / (float)game.Words.Length));
    }

    [TestMethod]
    public void Game_HasCorrectState()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Bob", IdGen.NewPlayerId(), galaxy);
        Api.FindGame("Akshay", IdGen.NewPlayerId(), galaxy);
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Petunia", IdGen.NewPlayerId(), galaxy);
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        Time.Update(Game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        Time.Update(.2f);
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
    public void Game_HasReasonablePhrase()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.IsTrue(game.Words.Length > 40);
        Assert.IsTrue(game.Words.Length < 100);
    }
}