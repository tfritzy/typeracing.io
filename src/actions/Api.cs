namespace LightspeedTyperacing;

public static class Api
{
    public static void FindGame(string playerName, string playerId, Galaxy galaxy)
    {
        if (galaxy.OpenGames.Count == 0)
        {
            Game game = new(galaxy);
            galaxy.OpenGames.Add(game);
        }

        Game openGame = galaxy.OpenGames[0];
        foreach (InGamePlayer player in openGame.Players)
        {
            galaxy.Outbox.Enqueue(
                new OneofUpdate
                {
                    RecipientId = player.Id,
                    PlayerJoinedGame = new PlayerJoinedGame()
                    {
                        GameId = openGame.Id,
                        PlayerId = playerId,
                        PlayerName = playerName
                    }
                });
        }
        openGame.Players.Add(new InGamePlayer(playerName, playerId));
        galaxy.PlayerGameMap[playerId] = openGame.Id;
        var youveBeenAddedToGame = new YouveBeenAddedToGame() { GameId = openGame.Id, };
        foreach (var p in openGame.Players)
            youveBeenAddedToGame.CurrentPlayers.Add(new Player { Id = p.Id, Name = p.Name });
        Console.WriteLine("Enquing youve");
        galaxy.Outbox.Enqueue(
            new OneofUpdate
            {
                RecipientId = playerId,
                YouveBeenAddedToGame = youveBeenAddedToGame
            });

        if (openGame.Players.Count == openGame.MaxPlayers)
        {
            galaxy.OpenGames.Remove(openGame);
            galaxy.ActiveGames[openGame.Id] = openGame;
            openGame.State = Game.GameState.Countdown;

            foreach (InGamePlayer player in openGame.Players)
            {
                galaxy.Outbox.Enqueue(new OneofUpdate
                {
                    RecipientId = player.Id,
                    GameStarting = new GameStarting
                    {
                        Countdown = Game.CountdownDuration,
                        Phrase = openGame.Phrase
                    }
                });
            }
        }
    }

    public static void TypeWord(string word, string playerId, Galaxy galaxy)
    {
        if (!galaxy.PlayerGameMap.ContainsKey(playerId))
        {
            return;
        }

        string gameId = galaxy.PlayerGameMap[playerId];
        if (!galaxy.ActiveGames.ContainsKey(gameId))
        {
            return;
        }

        Game game = galaxy.ActiveGames[galaxy.PlayerGameMap[playerId]];

        if (game.State != Game.GameState.Running)
        {
            Console.WriteLine($"Game {gameId} not running yet");
            return;
        }

        InGamePlayer? player = game.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            Console.WriteLine($"Player {playerId} not found in game {gameId}");
            return;
        }

        if (player.WordIndex >= game.Words.Length)
        {
            return;
        }

        Console.WriteLine($"Player {playerId} typed {word}");
        if (game.Words[player.WordIndex] == word)
        {
            player.WordIndex++;
            float velocity = Game.CalculateVelocity((float)player.WordIndex / game.Words.Length);
            player.Velocity_km_s = velocity;

            foreach (InGamePlayer p in game.Players)
            {
                galaxy.Outbox.Enqueue(
                    new OneofUpdate
                    {
                        RecipientId = p.Id,
                        WordFinished = new WordFinished
                        {
                            PlayerId = playerId,
                            PercentComplete = (float)player.WordIndex / game.Words.Length,
                            VelocityKmS = velocity,
                            PositionKm = player.PositionKm
                        }
                    }
                );
            }
        }

        if (player.WordIndex >= game.Words.Length)
        {
            game.Placements.Add(playerId);
            int place = game.Placements.Count;
            foreach (InGamePlayer p in game.Players)
            {
                galaxy.Outbox.Enqueue(new OneofUpdate
                {
                    RecipientId = p.Id,
                    PlayerCompleted = new PlayerCompleted
                    {
                        PlayerId = playerId,
                        Place = place
                    }
                });
            }
        }

        if (game.Players.All((p) => p.WordIndex >= game.Words.Length))
        {
            game.State = Game.GameState.Complete;

            foreach (InGamePlayer p in game.Players)
            {
                galaxy.Outbox.Enqueue(new OneofUpdate
                {
                    RecipientId = p.Id,
                    GameOver = new GameOver()
                });
            }
        }
    }
}