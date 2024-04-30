namespace LightspeedTyperacing;

public static class Api
{
    public static void FindGame(
        string playerName,
        string playerId,
        string playerToken,
        Galaxy galaxy,
        HashSet<GameMode>? enabledModes = null)
    {
        enabledModes ??= new HashSet<GameMode> { GameMode.Dictionary };
        var game = FindFirstMatchingGame(enabledModes, galaxy);
        if (game == null)
        {
            GameMode mode = enabledModes.ToArray()[new Random().Next(0, enabledModes.Count)];
            game = new(galaxy, mode: mode);
            galaxy.OpenGames.Add(game);
        }

        AddPlayerToGame(galaxy, game, new InGamePlayer(playerName, playerId, playerToken));
    }

    public static Game FindFirstMatchingGame(HashSet<GameMode> enabledModes, Galaxy galaxy)
    {
        lock (galaxy.OpenGames)
        {
            for (int i = 0; i < galaxy.OpenGames.Count; i++)
            {
                if (enabledModes.Contains(galaxy.OpenGames[i].Mode))
                {
                    return galaxy.OpenGames[i];
                }
            }
        }

        return null;
    }

    public static void AddPlayerToGame(Galaxy galaxy, Game game, InGamePlayer player)
    {
        foreach (InGamePlayer p in game.Players)
        {
            galaxy.SendUpdate(p, new OneofUpdate
            {
                RecipientId = p.Id,
                PlayerJoinedGame = new PlayerJoinedGame()
                {
                    GameId = game.Id,
                    PlayerId = player.Id,
                    PlayerName = player.Name,
                }
            });
        }

        game.Players.Add(player);
        galaxy.PlayerGameMap[player.Id] = game.Id;

        if (player.BotConfig == null)
        {
            var youveBeenAddedToGame = new YouveBeenAddedToGame() { GameId = game.Id, };
            foreach (var p in game.Players)
                youveBeenAddedToGame.CurrentPlayers.Add(new Player { Id = p.Id, Name = p.Name });
            galaxy.SendUpdate(
                player,
                new OneofUpdate
                {
                    RecipientId = player.Id,
                    YouveBeenAddedToGame = youveBeenAddedToGame
                });
        }

        if (game.Players.Count == game.MaxPlayers)
        {
            Api.StartGame(game, galaxy);
        }
    }

    public static void StartGame(Game openGame, Galaxy galaxy)
    {
        galaxy.OpenGames.Remove(openGame);
        lock (galaxy.ActiveGames)
        {
            galaxy.ActiveGames[openGame.Id] = openGame;
        }
        openGame.State = Game.GameState.Countdown;
        openGame.StartTime = galaxy.Time.Now;

        foreach (InGamePlayer player in openGame.Players)
        {
            galaxy.SendUpdate(player, new OneofUpdate
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

    public static void TypeWord(string word, List<float> charCompletionTimes, string playerId, Galaxy galaxy)
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

        if (game.Words[player.WordIndex] == word)
        {
            player.WordIndex++;
            float velocity = Game.CalculateVelocity_km_s((float)player.WordIndex / game.Words.Length);
            player.Velocity_km_s = velocity;
            player.CharCompletionTimes_s.AddRange(charCompletionTimes);

            foreach (InGamePlayer p in game.Players)
            {
                galaxy.SendUpdate(p, new OneofUpdate
                {
                    RecipientId = p.Id,
                    WordFinished = new WordFinished
                    {
                        PlayerId = playerId,
                        PercentComplete = (float)player.WordIndex / game.Words.Length,
                        VelocityKmS = velocity,
                        PositionKm = player.PositionKm,
                    }
                });
            }
        }
        else
        {
            Console.WriteLine($"Player {playerId} typed wrong word {word} instead of {game.Words[player.WordIndex]}");
        }

        Console.WriteLine($"Player {playerId} is {player.WordIndex}/{game.Words.Length} complete");

        if (player.WordIndex >= game.Words.Length)
        {
            Console.WriteLine($"Player {playerId} finished phrase.");
            game.Placements.Add(playerId);
            int place = game.Placements.Count - 1;
            foreach (InGamePlayer p in game.Players)
            {
                var playerCompleted = new PlayerCompleted
                {
                    PlayerId = playerId,
                    Place = place,
                    Wpm = Stats.GetWpm(game.Words.Length, player.CharCompletionTimes_s),
                };
                playerCompleted.WpmBySecond.AddRange(Stats.GetAggWpmBySecond(game.Phrase, player.CharCompletionTimes_s));
                playerCompleted.RawWpmBySecond.AddRange(Stats.GetRawWpmBySecond(game.Phrase, player.CharCompletionTimes_s));

                galaxy.SendUpdate(p, new OneofUpdate
                {
                    RecipientId = p.Id,
                    PlayerCompleted = playerCompleted
                });
            }
        }

        if (game.Players.All((p) => p.WordIndex >= game.Words.Length))
        {
            game.State = Game.GameState.Complete;

            foreach (InGamePlayer p in game.Players)
            {
                galaxy.SendUpdate(p, new OneofUpdate
                {
                    RecipientId = p.Id,
                    GameOver = new GameOver()
                    {
                        EndTimeS = galaxy.Time.Now - game.StartTime,
                    }
                });
            }
        }
    }

    public static void DisconnectPlayer(string playerId, Galaxy galaxy)
    {
        if (!galaxy.PlayerGameMap.ContainsKey(playerId))
        {
            return;
        }

        string gameId = galaxy.PlayerGameMap[playerId];
        Game? game = null;
        if (galaxy.ActiveGames.ContainsKey(gameId))
        {
            game = galaxy.ActiveGames[gameId];
        }
        else
        {
            game = galaxy.OpenGames.FirstOrDefault(g => g.Id == gameId);
        }

        if (game == null)
        {
            return;
        }

        InGamePlayer? player = game.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            return;
        }

        if (game.State == Game.GameState.Lobby)
        {
            game.Players.Remove(player);
            galaxy.PlayerGameMap.Remove(playerId);
        }
        else
        {
            player.IsDisconnected = true;
        }

        foreach (InGamePlayer p in game.Players)
        {
            galaxy.SendUpdate(p, new OneofUpdate
            {
                RecipientId = p.Id,
                PlayerDisconnected = new PlayerDisconnected
                {
                    PlayerId = playerId,
                    Removed = game.State == Game.GameState.Lobby,
                }
            });
        }

        if (game.Players.Count == 0)
        {
            galaxy.OpenGames.Remove(game);
        }
    }
}