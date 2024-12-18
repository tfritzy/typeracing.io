using typeracing.io;

namespace Tests;

[TestClass]
public class FindGameTests
{
    [TestMethod]
    public void FindGame_GameAddedToGalaxyIfNoneOpen()
    {
        var galaxy = new Galaxy();

        Assert.AreEqual(0, galaxy.OpenGames.Count);
        Api.FindGame("Alice", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Assert.AreEqual(1, galaxy.OpenGames.Count);
    }

    [TestMethod]
    public void FindGame_PlayerAddedToNewGame()
    {
        var galaxy = new Galaxy();
        var player = new InGamePlayer("Alice", IdGen.NewPlayerId(), IdGen.NewToken());
        Assert.AreEqual(0, galaxy.OutboxCount());
        Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);
        Game game = galaxy.OpenGames[0];

        Assert.AreEqual(1, game.Players.Count);
        Assert.AreEqual(player.Name, game.Players[0].Name);
        Assert.AreEqual(player.Id, game.Players[0].Id);

        Assert.AreEqual(1, galaxy.OutboxCount());
        Schema.OneofUpdate? message = galaxy.GetUpdate();
        Schema.YouveBeenAddedToGame jg = message!.YouveBeenAddedToGame;
        Assert.AreEqual(game.Id, jg.GameId);
        Assert.AreEqual(player.Id, jg.CurrentPlayers[0].id);
        Assert.AreEqual(player.Name, jg.CurrentPlayers[0].Name);
    }

    [TestMethod]
    public void FindGame_AllPlayersAlreadyInGameInformed()
    {
        var galaxy = new Galaxy();
        var player1 = new InGamePlayer("Alice", IdGen.NewPlayerId(), IdGen.NewToken());
        var player2 = new InGamePlayer("Bob", IdGen.NewPlayerId(), IdGen.NewToken());
        var player3 = new InGamePlayer("Charlie", IdGen.NewPlayerId(), IdGen.NewToken());
        Api.FindGame(player1.Name, player1.Id, player1.Token, galaxy, false);
        Api.FindGame(player2.Name, player2.Id, player2.Token, galaxy, false);

        Assert.AreEqual(3, galaxy.OutboxCount());
        galaxy.ClearOutbox();

        Api.FindGame(player3.Name, player3.Id, player3.Token, galaxy, false);
        Assert.AreEqual(3, galaxy.OutboxCount());
        var messages = galaxy.OutboxMessages();
        var playerJoinedGameMessages = messages.Where(m => m.PlayerJoinedGame != null);
        var addedToGameMessages = messages.Where(m => m.YouveBeenAddedToGame != null);

        Assert.AreEqual(1, addedToGameMessages.Count());
        Assert.AreEqual(2, playerJoinedGameMessages.Count());
        Assert.AreEqual(1, playerJoinedGameMessages.Count(m => m.RecipientId == player1.Id));
        Assert.AreEqual(1, playerJoinedGameMessages.Count(m => m.RecipientId == player2.Id));
        Assert.IsTrue(playerJoinedGameMessages.All(m => m.PlayerJoinedGame.Player.id == player3.Id));
        Assert.IsTrue(playerJoinedGameMessages.All(m => m.PlayerJoinedGame.Player.Name == player3.Name));

        var addedToGameMessage = addedToGameMessages.First();
        Assert.AreEqual(player3.Id, addedToGameMessage.RecipientId);
        Assert.AreEqual(3, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count);
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.id == player1.Id));
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.id == player2.Id));
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.id == player3.Id));
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.Name == player1.Name));
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.Name == player2.Name));
        Assert.AreEqual(1, addedToGameMessage.YouveBeenAddedToGame.CurrentPlayers.Count(p => p.Name == player3.Name));
        Assert.AreEqual(galaxy.OpenGames[0].Id, addedToGameMessage.YouveBeenAddedToGame.GameId);
    }

    [TestMethod]
    public void FindGame_UpdatesPlayerGameMap()
    {
        var galaxy = new Galaxy();

        var player1 = new InGamePlayer("Alice", IdGen.NewPlayerId(), IdGen.NewToken());
        Assert.AreEqual(0, galaxy.PlayerGameMap.Count);
        Api.FindGame(player1.Name, player1.Id, player1.Token, galaxy, false);
        Assert.AreEqual(1, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player1.Id]);

        var player2 = new InGamePlayer("Bob", IdGen.NewPlayerId(), IdGen.NewToken());
        Api.FindGame(player2.Name, player2.Id, player2.Token, galaxy, false);
        Assert.AreEqual(2, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player1.Id]);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player2.Id]);

        for (int i = 0; i < 2; i++)
        {
            var player = new InGamePlayer($"Player {i}", IdGen.NewPlayerId(), IdGen.NewToken());
            Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);
        }

        var player3 = new InGamePlayer("Charlie", IdGen.NewPlayerId(), IdGen.NewToken());
        Api.FindGame(player3.Name, player3.Id, player3.Token, galaxy, false);
        Assert.AreEqual(5, galaxy.PlayerGameMap.Count);
        Assert.AreEqual(galaxy.OpenGames[0].Id, galaxy.PlayerGameMap[player3.Id]);
    }

    [TestMethod]
    public void FindGame_FindsFirstMatchingGamePreference()
    {
        var galaxy = new Galaxy();
        Api.FindGame("Jeff 1", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false);
        Assert.AreEqual(1, galaxy.OpenGames.Count);
        Assert.AreEqual(Schema.GameMode.Dictionary, galaxy.OpenGames[0].Mode);
        Assert.AreEqual(1, galaxy.OpenGames[0].Players.Count);

        Api.FindGame("Jeff 2", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false, new HashSet<Schema.GameMode> { Schema.GameMode.Numbers });
        Assert.AreEqual(2, galaxy.OpenGames.Count);
        Assert.AreEqual(Schema.GameMode.Numbers, galaxy.OpenGames[1].Mode);
        Assert.AreEqual(1, galaxy.OpenGames[1].Players.Count);

        Api.FindGame("Jeff 3", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false, new HashSet<Schema.GameMode> { Schema.GameMode.Numbers });
        Assert.AreEqual(2, galaxy.OpenGames.Count);
        Assert.AreEqual(2, galaxy.OpenGames[1].Players.Count);

        Api.FindGame("Jeff 4", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false, new HashSet<Schema.GameMode> { Schema.GameMode.SpamTap, Schema.GameMode.Numbers });
        Assert.AreEqual(2, galaxy.OpenGames.Count);
        Assert.AreEqual(3, galaxy.OpenGames[1].Players.Count);

        Api.FindGame("Jeff 5", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false, new HashSet<Schema.GameMode> { Schema.GameMode.CopyPastas });
        Assert.AreEqual(3, galaxy.OpenGames.Count);

        Api.FindGame("Jeff 6", IdGen.NewPlayerId(), IdGen.NewToken(), galaxy, false, new HashSet<Schema.GameMode> { Schema.GameMode.CopyPastas, Schema.GameMode.Numbers });
        Assert.AreEqual(2, galaxy.OpenGames.Count);
    }

    [TestMethod]
    public void FindGame_InformsOfPhrase()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();

        InGamePlayer player = new(name: $"Player 0", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
        players.Add(player);
        Api.FindGame(player.Name, player.Id, player.Token, galaxy, false);

        var youveBeenAddedMessages = galaxy.OutboxMessages().Where(m => m.YouveBeenAddedToGame != null).ToArray();
        Assert.AreEqual(1, youveBeenAddedMessages.Length);
        Assert.AreEqual(
            galaxy.OpenGames[0].Phrase,
            youveBeenAddedMessages[0].YouveBeenAddedToGame.Phrase
        );
    }

    [TestMethod]
    public void FindGame_PrivateGame()
    {
        var galaxy = new Galaxy();
        var players = new List<InGamePlayer>();

        InGamePlayer player = new(name: $"Player 0", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
        players.Add(player);
        Api.FindGame(player.Name, player.Id, player.Token, galaxy, true);

        var youveBeenAddedMessages = galaxy.OutboxMessages().Where(m => m.YouveBeenAddedToGame != null).ToArray();
        Assert.AreEqual(1, youveBeenAddedMessages.Length);

        Assert.AreEqual(1, galaxy.ActiveGames.Count);
        Assert.AreEqual(0, galaxy.OpenGames.Count);
    }
}