namespace Tests;

[TestClass]
public class BotTests
{
    class TestSetup
    {
        public Galaxy Galaxy;
        public InGamePlayer RealPlayer;

        public TestSetup()
        {
            Galaxy = new();
            RealPlayer = new(name: $"Real player", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            Api.FindGame(RealPlayer.Name, RealPlayer.Id, RealPlayer.Token, Galaxy);
        }
    }

    [TestMethod]
    public void Bots_AddsBotsIfNoPlayers()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        test.Galaxy.Time.Update(Constants.TimeBeforeFillingBots - .1f);
        test.Galaxy.Update();
        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(Game.GameState.Lobby, game.State);

        test.Galaxy.Time.Update(Constants.TimeBeforeFillingBots + .1f);
        test.Galaxy.Update();
        Assert.AreEqual(4, game.Players.Count);
        Assert.AreEqual(3, game.Players.Count(p => p.BotConfig != null));
    }
}