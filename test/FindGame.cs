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
        Api.FindGame(request, galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(request.PlayerName, game.Players[0].Name);
        Assert.AreEqual(request.PlayerId, game.Players[0].Id);
    }
}