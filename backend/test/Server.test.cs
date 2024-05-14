namespace Tests;

[TestClass]
public class ServerTests
{
    [TestMethod]
    public void Server_HandlesRequestTypes()
    {
        Server server = new();
        Galaxy galaxy = server.Galaxy;

        server.HandleRequest(new OneofRequest
        {
            SenderId = IdGen.NewPlayerId(),
            FindGame = new FindGameRequest { PlayerName = "Alice" }
        });

        Assert.AreEqual(1, galaxy.OpenGames.Count);
        Assert.AreEqual(1, galaxy.OpenGames[0].Players.Count);
        Assert.AreEqual(1, galaxy.OutboxCount());

        server.HandleRequest(new OneofRequest
        {
            SenderId = IdGen.NewPlayerId(),
            TypeWord = new TypeWordRequest { Word = "hello" }
        });

        Assert.AreEqual(1, galaxy.OutboxCount());
    }
}