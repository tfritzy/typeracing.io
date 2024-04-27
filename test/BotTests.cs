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
            Galaxy.Time.Update(10f);
            RealPlayer = new(name: $"Real player", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            Api.FindGame(RealPlayer.Name, RealPlayer.Id, RealPlayer.Token, Galaxy);
        }
    }

    [TestMethod]
    public void Bots_AddsBotsIfNoPlayers()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];
        float time = test.Galaxy.Time.Now + Constants.TimeBeforeFillingBots - .1f;

        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(Game.GameState.Lobby, game.State);

        time += .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.AreEqual(4, game.Players.Count);
        Assert.AreEqual(3, game.Players.Count(p => p.BotConfig != null));
    }

    [TestMethod]
    public void Bots_BeTypin()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        float time = test.Galaxy.Time.Now + Constants.TimeBeforeFillingBots - .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.AreEqual(1, game.Players.Count);

        time += .2f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        var bots = game.Players.Where(p => p.BotConfig != null).ToList();
        Assert.AreEqual(4, game.Players.Count);
        Assert.AreEqual(Game.GameState.Countdown, game.State);

        time += Game.CountdownDuration + .1f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.AreEqual(Game.GameState.Running, game.State);
        Assert.IsTrue(bots.All(b => b.WordIndex == 0));

        time += 20f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.IsTrue(bots.All(b => b.WordIndex == 1));

        time += 20f;
        test.Galaxy.Time.Update(time);
        test.Galaxy.Update();
        Assert.IsTrue(bots.All(b => b.WordIndex == 2));
    }
}