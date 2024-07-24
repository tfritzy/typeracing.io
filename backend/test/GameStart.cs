using Schema;

namespace Tests;

[TestClass]
public class Test_GameStart
{
    [TestMethod]
    public void Test_GameStart_SendsCountdown()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();
        for (int i = 0; i < 3; i++)
        {
            InGamePlayer player = new InGamePlayer($"Player {i}", IdGen.NewPlayerId(), IdGen.NewToken());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);
        }

        galaxy.ClearOutbox();
        players.Add(new InGamePlayer(name: "Player 3", id: IdGen.NewPlayerId(), token: IdGen.NewToken()));
        Assert.AreEqual(1, galaxy.OpenGames.Count);
        Assert.AreEqual(0, galaxy.ActiveGames.Count);
        Api.FindGame("Player 3", players[3].Id, players[3].Token, galaxy, false);
        Game game = galaxy.ActiveGames.Values.First();
        Assert.AreEqual(0, galaxy.OpenGames.Count);
        Assert.AreEqual(1, galaxy.ActiveGames.Count);
        OneofUpdate[] messages =
            galaxy.OutboxMessages().Where(m => m.GameStarting != null).ToArray();
        Assert.AreEqual(4, messages.Length);
        Assert.AreEqual(4, messages.Count(m => m.GameStarting.Countdown == game.CountdownDuration));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[0].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[1].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[2].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[3].Id));
    }

    [TestMethod]
    public void Test_GameStart_SendsGameStartedEvent()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();
        for (int i = 0; i < 4; i++)
        {
            InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);
        }
        Game game = galaxy.ActiveGames.Values.First();

        galaxy.ClearOutbox();
        galaxy.Time.Update(game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(0, galaxy.OutboxMessages().Where(m => m.GameStarted != null).Count());
        galaxy.Time.Update(game.CountdownDuration + .1f);
        galaxy.Update();
        OneofUpdate[] messages = galaxy.OutboxMessages().Where(m => m.GameStarted != null).ToArray();
        Assert.AreEqual(4, messages.Length);
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[0].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[1].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[2].Id));
        Assert.AreEqual(1, messages.Count(m => m.RecipientId == players[3].Id));
    }

    [TestMethod]
    public void GameStart_StopsSendingStartEvent()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();
        for (int i = 0; i < 4; i++)
        {
            InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);
        }

        galaxy.ClearOutbox();
        galaxy.Time.Update(galaxy.ActiveGames.Values.First().CountdownDuration + .1f);
        galaxy.Update();
        Assert.AreEqual(4, galaxy.OutboxMessages().Where(m => m.GameStarted != null).Count());
        galaxy.ClearOutbox();

        galaxy.Time.Update(.1f);
        galaxy.Update();
        Assert.AreEqual(0, galaxy.OutboxMessages().Where(m => m.GameStarted != null).Count());
    }
}