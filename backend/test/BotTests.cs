using typeracing.io;

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
            Api.FindGame(RealPlayer.Name, RealPlayer.Id, RealPlayer.Token, Galaxy, false);
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

        test.Galaxy.Time.Update(.1f);
        test.Galaxy.Update();
        Assert.AreEqual(4, game.Players.Count);
        Assert.AreEqual(3, game.Players.Count(p => p.BotConfig != null));
    }

    [TestMethod]
    public void Bots_BeTypin()
    {
        TestSetup test = new();
        Game game = test.Galaxy.OpenGames[0];

        test.Galaxy.Time.Update(Constants.TimeBeforeFillingBots - .1f);
        test.Galaxy.Update();
        Assert.AreEqual(1, game.Players.Count);

        test.Galaxy.Time.Update(.2f);
        test.Galaxy.Update();
        var bots = game.Players.Where(p => p.BotConfig != null).ToList();
        Assert.AreEqual(4, game.Players.Count);
        Assert.AreEqual(Game.GameState.Countdown, game.State);

        test.Galaxy.Time.Update(game.CountdownDuration + .1f);
        test.Galaxy.Update();
        Assert.AreEqual(Game.GameState.Running, game.State);
        Assert.IsTrue(bots.All(b => b.PhraseIndex == 0));

        test.Galaxy.Time.Update(20f);
        test.Galaxy.Update();
        int phraseIndex = TH.KeystrokesForWord(game.Phrase, 0).Count;
        Assert.IsTrue(bots.All(b => b.PhraseIndex == phraseIndex));

        test.Galaxy.Time.Update(20f);
        test.Galaxy.Update();
        phraseIndex += TH.KeystrokesForWord(game.Phrase, 1).Count;
        Assert.IsTrue(bots.All(b => b.PhraseIndex == phraseIndex));
    }

    [TestMethod]
    public void Bots_ShouldHaveCorrectWpmAtEnd()
    {

    }
}