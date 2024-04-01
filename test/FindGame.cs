namespace test;
using LightspeedTyping;

[TestClass]
public class FindGame
{
    [TestMethod]
    public void FindGame_GameAddedToGalaxyIfNoneOpen()
    {
        var galaxy = new Galaxy();

        Assert.AreEqual(0, galaxy.OpenGames.Count);
        Api.FindGame("Alice", IdGen.NewPlayerId(), galaxy);
        Assert.AreEqual(1, galaxy.OpenGames.Count);
    }

    [TestMethod]
    public void FindGame_PlayerAddedToNewGame()
    {
        var galaxy = new Galaxy();
        var player = new InGamePlayer("Alice", IdGen.NewPlayerId());
        Assert.AreEqual(0, galaxy.Outbox.Count);
        Api.FindGame(player.Name, player.Id, galaxy);
        Game game = galaxy.OpenGames[0];

        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(player.Name, game.Players[0].Name);
        Assert.AreEqual(player.Id, game.Players[0].Id);

        Assert.AreEqual(1, galaxy.Outbox.Count);
        var message = galaxy.Outbox.Dequeue();
        PlayerJoinedGame jg = (PlayerJoinedGame)message;
        Assert.AreEqual(player.Id, jg.PlayerId);
        Assert.AreEqual(game.Id, jg.GameId);
    }

    [TestMethod]
    public void FindGame_AllPlayersAlreadyInGameInformed()
    {
        var galaxy = new Galaxy();
        var player1 = new InGamePlayer("Alice", IdGen.NewPlayerId());
        var player2 = new InGamePlayer("Bob", IdGen.NewPlayerId());
        var player3 = new InGamePlayer("Charlie", IdGen.NewPlayerId());
        Api.FindGame(player1.Name, player1.Id, galaxy);
        Api.FindGame(player2.Name, player2.Id, galaxy);

        Assert.AreEqual(3, galaxy.Outbox.Count);
        galaxy.Outbox.Clear();

        Api.FindGame(player3.Name, player3.Id, galaxy);
        Assert.AreEqual(3, galaxy.Outbox.Count);
        var messages = galaxy.Outbox.ToArray();

        Assert.AreEqual(player1.Id, ((PlayerJoinedGame)messages[0]).SenderOrRecipientId);
        Assert.AreEqual(player2.Id, ((PlayerJoinedGame)messages[1]).SenderOrRecipientId);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[2]).SenderOrRecipientId);

        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[0]).PlayerId);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[1]).PlayerId);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[2]).PlayerId);

        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[0]).PlayerName);
        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[1]).PlayerName);
        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[2]).PlayerName);
    }

    [TestMethod]
    public void FindGame_UpdatesPlayerGameMap()
    {
        var galaxy = new Galaxy();

        var player1 = new InGamePlayer("Alice", IdGen.NewPlayerId());
        Assert.AreEqual(0, galaxy.PlayerGameMap.Count);
        Api.FindGame(player1.Name, player1.Id, galaxy);
        Assert.AreEqual(1, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player1.Id]);

        var player2 = new InGamePlayer("Bob", IdGen.NewPlayerId());
        Api.FindGame(player2.Name, player2.Id, galaxy);
        Assert.AreEqual(2, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player1.Id]);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player2.Id]);

        for (int i = 0; i < 2; i++)
        {
            var player = new InGamePlayer($"Player {i}", IdGen.NewPlayerId());
            Api.FindGame(player.Name, player.Id, galaxy);
        }

        var player3 = new InGamePlayer("Charlie", IdGen.NewPlayerId());
        Api.FindGame(player3.Name, player3.Id, galaxy);
        Assert.AreEqual(5, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player3.Id]);
    }
}