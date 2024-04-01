namespace Tests;

using System.Buffers;
using LightspeedTyping;

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
            InGamePlayer player = new InGamePlayer(name: $"Player {i}", id: IdGen.NewPlayerId());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, galaxy);
        }

        galaxy.Outbox.Clear();
        players.Add(new InGamePlayer(name: "Player 3", id: IdGen.NewPlayerId()));
        Assert.AreEqual(1, galaxy.OpenGames.Count);
        Assert.AreEqual(0, galaxy.ActiveGames.Count);
        Api.FindGame("Player 3", players[3].Id, galaxy);
        Assert.AreEqual(0, galaxy.OpenGames.Count);
        Assert.AreEqual(1, galaxy.ActiveGames.Count);
        GameStarting[] messages = galaxy.Outbox.OfType<GameStarting>().ToArray();
        Assert.AreEqual(4, messages.Length);
        Assert.AreEqual(4, messages.Count(m => m.Seconds == 3));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[0].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[1].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[2].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[3].Id));
    }

    [TestMethod]
    public void Test_GameStart_SendsGameStartedEvent()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();
        for (int i = 0; i < 4; i++)
        {
            InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, galaxy);
        }

        galaxy.Outbox.Clear();
        Time.Update(Game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(0, galaxy.Outbox.Count);
        Time.Update(.2f);
        galaxy.Update();
        GameStarted[] messages = galaxy.Outbox.OfType<GameStarted>().ToArray();
        Assert.AreEqual(4, messages.Length);
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[0].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[1].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[2].Id));
        Assert.AreEqual(1, messages.Count(m => m.SenderOrRecipientId == players[3].Id));
    }
}