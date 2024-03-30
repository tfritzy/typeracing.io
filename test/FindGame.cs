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
        Api.FindGame(new FindGameRequest(name: "Alice", id: Guid.NewGuid()), galaxy);
        Assert.AreEqual(1, galaxy.OpenGames.Count);
    }

    [TestMethod]
    public void FindGame_PlayerAddedToNewGame()
    {
        var galaxy = new Galaxy();
        FindGameRequest request = new(name: "Alice", id: Guid.NewGuid());
        Assert.AreEqual(0, galaxy.Outbox.Count);
        Api.FindGame(request, galaxy);
        Game game = galaxy.OpenGames[0];

        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(request.PlayerName, game.Players[0].Name);
        Assert.AreEqual(request.Recipient, game.Players[0].Id);

        Assert.AreEqual(1, galaxy.Outbox.Count);
        var message = galaxy.Outbox.Dequeue();
        PlayerJoinedGame jg = (PlayerJoinedGame)message;
        Assert.AreEqual(request.Recipient, jg.PlayerId);
        Assert.AreEqual(game.Id, jg.GameId);
    }

    [TestMethod]
    public void FindGame_AllPlayersAlreadyInGameInformed()
    {
        var galaxy = new Galaxy();
        var player1 = new Player("Alice", Guid.NewGuid());
        var player2 = new Player("Bob", Guid.NewGuid());
        var player3 = new Player("Charlie", Guid.NewGuid());
        Api.FindGame(new FindGameRequest(name: player1.Name, id: player1.Id), galaxy);
        Api.FindGame(new FindGameRequest(name: player2.Name, id: player2.Id), galaxy);

        Assert.AreEqual(3, galaxy.Outbox.Count);
        galaxy.Outbox.Clear();

        Api.FindGame(new FindGameRequest(name: player3.Name, id: player3.Id), galaxy);
        Assert.AreEqual(3, galaxy.Outbox.Count);
        var messages = galaxy.Outbox.ToArray();

        Assert.AreEqual(player1.Id, ((PlayerJoinedGame)messages[0]).Recipient);
        Assert.AreEqual(player2.Id, ((PlayerJoinedGame)messages[1]).Recipient);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[2]).Recipient);

        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[0]).PlayerId);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[1]).PlayerId);
        Assert.AreEqual(player3.Id, ((PlayerJoinedGame)messages[2]).PlayerId);

        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[0]).PlayerName);
        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[1]).PlayerName);
        Assert.AreEqual(player3.Name, ((PlayerJoinedGame)messages[2]).PlayerName);
    }
}