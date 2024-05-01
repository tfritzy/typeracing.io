namespace Tests;

[TestClass]
public class DisconnectTests
{
    class TestSetup
    {
        public Galaxy Galaxy;
        public InGamePlayer Player1;
        public InGamePlayer Player2;

        public TestSetup()
        {
            Galaxy = new();
            Galaxy.Time.Update(10f);
            Player1 = new(name: $"Player 1", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            Player2 = new(name: $"Player 2", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            Api.FindGame(Player1.Name, Player1.Id, Player1.Token, Galaxy);
            Api.FindGame(Player2.Name, Player2.Id, Player2.Token, Galaxy);
        }
    }

    [TestMethod]
    public void Disconnect_MarksPlayerDisconnectedIfGameRunning()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        Api.StartGame(game, test.Galaxy);
        Api.DisconnectPlayer(test.Player1.Id, test.Galaxy);
        Assert.IsTrue(game.Players[0].IsDisconnected);
        Assert.IsFalse(game.Players[1].IsDisconnected);
    }

    [TestMethod]
    public void Disconnect_GracefullyHandlesInvalidValues()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        Api.StartGame(game, test.Galaxy);
        Api.DisconnectPlayer("invalid", test.Galaxy);
        Api.DisconnectPlayer(test.Player1.Id, new Galaxy());
        test.Galaxy.PlayerGameMap.Add("random_value", game.Id);
        Api.DisconnectPlayer("random_value", test.Galaxy);

        Assert.IsFalse(game.Players[0].IsDisconnected);
        Assert.IsFalse(game.Players[1].IsDisconnected);
    }

    [TestMethod]
    public void Disconnect_JustRemovesFromLobby()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];
        test.Galaxy.ClearOutbox();

        Api.DisconnectPlayer(test.Player1.Id, test.Galaxy);
        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Assert.IsFalse(test.Galaxy.PlayerGameMap.ContainsKey(test.Player1.Id));
        PlayerDisconnected dc = test.Galaxy.GetUpdate()!.PlayerDisconnected;
        Assert.AreEqual(test.Player1.Id, dc.PlayerId);
        Assert.IsTrue(dc.Removed);
    }

    [TestMethod]
    public void Disconnect_SendsDisconnectedEvent()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];
        test.Galaxy.ClearOutbox();

        Api.DisconnectPlayer(test.Player1.Id, test.Galaxy);
        Assert.AreEqual(1, test.Galaxy.OutboxCount());
        OneofUpdate? update = test.Galaxy.GetUpdate();
        Assert.IsNotNull(update);
        Assert.AreEqual(test.Player2.Id, update.RecipientId);
        PlayerDisconnected disconnected = update.PlayerDisconnected;
        Assert.AreEqual(test.Player1.Id, disconnected.PlayerId);

    }

    [TestMethod]
    public void Disconnect_StopsSendingUpdatesToPlayer()
    {
        TestSetup test = new();
        InGamePlayer player3 = new($"Player 3", IdGen.NewPlayerId(), IdGen.NewToken());
        Api.FindGame(player3.Name, player3.Id, player3.Token, test.Galaxy);
        Game game = test.Galaxy.OpenGames[0];

        Api.StartGame(game, test.Galaxy);
        test.Galaxy.ClearOutbox();
        Api.DisconnectPlayer(test.Player1.Id, test.Galaxy);

        Assert.AreEqual(2, test.Galaxy.OutboxCount()); // player 2 and player 3
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Count(u => u.RecipientId == test.Player2.Id));
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Count(u => u.RecipientId == player3.Id));

        test.Galaxy.ClearOutbox();
        test.Galaxy.Time.Update(test.Galaxy.Time.Now + Game.CountdownDuration + 1f);
        test.Galaxy.Update();

        Assert.AreEqual(2, test.Galaxy.OutboxCount()); // Player 2 and player 3
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Count(u => u.RecipientId == test.Player2.Id));
        Assert.AreEqual(1, test.Galaxy.OutboxMessages().Count(u => u.RecipientId == player3.Id));
    }

    [TestMethod]
    public void Disconnect_DeletesGameIfNoPlayersRemain()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        Api.DisconnectPlayer(test.Player1.Id, test.Galaxy);
        Assert.AreEqual(1, test.Galaxy.OpenGames.Count);
        Assert.AreEqual(1, game.Players.Count);

        Api.DisconnectPlayer(test.Player2.Id, test.Galaxy);
        Assert.AreEqual(0, test.Galaxy.OpenGames.Count);
        Assert.AreEqual(0, test.Galaxy.ActiveGames.Count);
    }
}