namespace LightspeedTyping;

[TestClass]
public class GameTests
{
    [TestMethod]
    public void Game_TypingIgnoredBeforeGameStart()
    {
        Galaxy galaxy = new();
        List<InGamePlayer> players = new();
        for (int i = 0; i < 4; i++)
        {
            InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId());
            players.Add(player);
            Api.FindGame(player.Name, player.Id, galaxy);
        }

        galaxy.Outbox.Clear();

        var game = galaxy.ActiveGames[galaxy.PlayerGameMap[players[0].Id]];

        // Ignored before game starts
        Api.CompleteWord(game.Words[0], players[0].Id, galaxy);
        Assert.AreEqual(0, game.Players[0].WordIndex);

        Time.Update(Game.CountdownDuration + .1f);
        galaxy.Update();

        // Works now
        Api.CompleteWord(game.Words[0], players[0].Id, galaxy);
        Assert.AreEqual(1, game.Players[0].WordIndex);
    }

    [TestMethod]
    public void Game_HasCorrectState()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Bob", IdGen.NewPlayerId(), galaxy);
        Api.FindGame("Akshay", IdGen.NewPlayerId(), galaxy);
        Assert.AreEqual(Game.GameState.Lobby, game.State);
        Api.FindGame("Petunia", IdGen.NewPlayerId(), galaxy);
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        Time.Update(Game.CountdownDuration - .1f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Countdown, game.State);
        Time.Update(.2f);
        galaxy.Update();
        Assert.AreEqual(Game.GameState.Running, game.State);

        // TODO: Game end
    }

    [TestMethod]
    public void Phrases_ParsesPhrase()
    {
        CollectionAssert.AreEqual(
            Phrases.GetWords("The world is just so beautiful."),
            new string[] { "The", "world", "is", "just", "so", "beautiful." }
        );
    }

    [TestMethod]
    public void Game_HasReasonablePhrase()
    {
        Galaxy galaxy = new();
        Api.FindGame("Alice", IdGen.NewPlayerId(), galaxy);
        Game game = galaxy.OpenGames[0];
        Assert.IsTrue(game.Words.Length > 40);
        Assert.IsTrue(game.Words.Length < 100);
    }
}