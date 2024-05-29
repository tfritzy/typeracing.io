namespace LightspeedTyperacing;

public static class Api
{
    public static void FindGame(
        string playerName,
        string playerId,
        string playerToken,
        Galaxy galaxy,
        bool practice,
        HashSet<GameMode>? enabledModes = null)
    {
        enabledModes ??= new HashSet<GameMode> { GameMode.Dictionary };
        if (enabledModes.Count == 0)
            enabledModes.Add(GameMode.Dictionary);

        var game = FindFirstMatchingGame(enabledModes, galaxy);
        if (game == null)
        {
            GameMode mode = enabledModes.ToArray()[new Random().Next(0, enabledModes.Count)];
            game = new(galaxy, mode: mode, maxPlayers: practice ? 1 : 4);
            galaxy.OpenGames.Add(game);
            Logger.Log($"Created new game {game.Id} with mode {mode}.");
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
            galaxy.SendUpdate(p, game.Id, new OneofUpdate
            {
                PlayerJoinedGame = new PlayerJoinedGame()
                {
                    GameId = game.Id,
                    Player = new Player
                    {
                        Id = player.Id,
                        Name = player.Name,
                        IsBot = player.BotConfig != null
                    },
                }
            });
        }

        player.LastSeen = galaxy.Time.Now;
        game.Players.Add(player);
        galaxy.PlayerGameMap[player.Id] = game.Id;

        if (player.BotConfig == null)
        {
            var youveBeenAddedToGame = new YouveBeenAddedToGame()
            {
                GameId = game.Id,
                Phrase = game.Phrase
            };
            foreach (var p in game.Players)
                youveBeenAddedToGame.CurrentPlayers.Add(
                    new Player
                    {
                        Id = p.Id,
                        Name = p.Name,
                        IsBot = p.BotConfig != null
                    });
            galaxy.SendUpdate(
                player,
                game.Id,
                new OneofUpdate
                {
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
            galaxy.SendUpdate(player, openGame.Id, new OneofUpdate
            {
                GameStarting = new GameStarting
                {
                    Countdown = Game.CountdownDuration,
                }
            });
        }
    }

    public static string ParseKeystrokes(List<KeyStroke> keyStrokes)
    {
        Stack<char> wordStack = new();
        foreach (KeyStroke keyStroke in keyStrokes)
        {
            if (keyStroke.Character == "\b")
            {
                if (wordStack.Count > 0)
                {
                    wordStack.Pop();
                }
            }
            else
            {
                wordStack.Push(keyStroke.Character[0]);
            }
        }

        string typedWord = new(wordStack.Reverse().ToArray());
        return typedWord;
    }

    public static bool IsTypedCorrect(string typed, string phrase, int startIndex)
    {
        if (typed.Length + startIndex > phrase.Length)
        {
            return false;
        }

        for (int i = 0; i < typed.Length; i++)
        {
            if (i + startIndex >= phrase.Length || typed[i] != phrase[i + startIndex])
            {
                return false;
            }
        }

        return true;
    }

    public static int CountErrors(List<KeyStroke> keyStrokes, string phrase, int startIndex)
    {
        int errors = 0;
        int phraseIndex = startIndex;
        foreach (KeyStroke keyStroke in keyStrokes)
        {
            if (keyStroke.Character == "\b")
            {
                if (phraseIndex > 0)
                {
                    phraseIndex--;
                }
            }
            else
            {
                if (phraseIndex > phrase.Length || keyStroke.Character[0] != phrase[phraseIndex])
                {
                    errors++;
                }
                phraseIndex++;
            }
        }

        return errors;
    }


    public static void TypeWord(List<KeyStroke> keyStrokes, string playerId, Galaxy galaxy)
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
            return;
        }

        InGamePlayer? player = game.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            return;
        }

        if (player.PhraseIndex >= game.Phrase.Length)
        {
            return;
        }

        string typed = ParseKeystrokes(keyStrokes);

        if (IsTypedCorrect(typed, game.Phrase, player.PhraseIndex))
        {
            player.Errors += CountErrors(keyStrokes, game.Phrase, player.PhraseIndex);
            player.KeyStrokes.AddRange(keyStrokes);
            player.PhraseIndex += typed.Length;

            foreach (InGamePlayer p in game.Players)
            {
                float percentComplete = (float)player.PhraseIndex / game.Phrase.Length;
                galaxy.SendUpdate(p, gameId, new OneofUpdate
                {
                    WordFinished = new WordFinished
                    {
                        PlayerId = playerId,
                        PercentComplete = (float)player.PhraseIndex / game.Phrase.Length,
                        Wpm = Stats.GetWpm(player.KeyStrokes),
                    }
                });
            }
        }
        else
        {
            Logger.Log($"Player {player.Name} typed wrong word '{typed}' in phrase '{game.Phrase}' at index {player.PhraseIndex}.");
        }

        if (player.PhraseIndex >= game.Phrase.Length)
        {
            Logger.Log($"Player {playerId} finished phrase.");
            game.Placements.Add(playerId);
            int place = game.Placements.Count - 1;
            foreach (InGamePlayer p in game.Players)
            {
                var playerCompleted = new PlayerCompleted
                {
                    PlayerId = playerId,
                    Place = place,
                    Wpm = Stats.GetWpm(player.KeyStrokes),
                    Accuracy = game.Phrase.Length / ((float)game.Phrase.Length + player.Errors),
                    Mode = game.Mode,
                    NumErrors = player.Errors,
                };
                playerCompleted.WpmBySecond.AddRange(Stats.GetAggWpmBySecond(player.KeyStrokes));
                playerCompleted.RawWpmBySecond.AddRange(Stats.GetRawWpmBySecond(player.KeyStrokes));
                playerCompleted.ErrorsAtTime.AddRange(Stats.GetErrorCountByTime(player.KeyStrokes, game.Phrase));

                galaxy.SendUpdate(p, game.Id, new OneofUpdate
                {
                    PlayerCompleted = playerCompleted
                });
            }
        }

        CheckGameOver(galaxy, game);
    }

    private static void CheckGameOver(Galaxy galaxy, Game game)
    {
        if (game.Players.All((p) => p.PhraseIndex >= game.Phrase.Length || game.HasPlayerLeft(p)))
        {
            Logger.Log($"Game {game.Id} is over.");
            game.State = Game.GameState.Complete;

            foreach (InGamePlayer p in game.Players)
            {
                galaxy.SendUpdate(p, game.Id, new OneofUpdate
                {
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

        if (player.BotConfig != null)
        {
            return;
        }

        Logger.Log($"Disconnecting {playerId}.");

        foreach (InGamePlayer p in game.Players)
        {
            galaxy.SendUpdate(p, game.Id, new OneofUpdate
            {
                PlayerDisconnected = new PlayerDisconnected
                {
                    PlayerId = playerId,
                    Removed = game.State == Game.GameState.Lobby,
                    IsYou = p.Id == playerId,
                }
            });
        }

        galaxy.PlayerGameMap.Remove(playerId);

        if (game.State == Game.GameState.Lobby)
        {
            Logger.Log($"Removing player {playerId} from game {gameId}.");
            game.Players.Remove(player);
        }
        else
        {
            player.IsDisconnected = true;
        }

        CheckGameOver(galaxy, game);

        if (game.Players.Count == 0)
        {
            Logger.Log($"Removing game {gameId}.");
            galaxy.OpenGames.Remove(game);
        }
    }

    public static void CloseGame(Galaxy galaxy, Game game)
    {
        Logger.Log($"Closing game {game.Id}.");
        foreach (InGamePlayer player in new List<InGamePlayer>(game.Players))
        {
            if (!game.HasPlayerLeft(player))
            {
                DisconnectPlayer(player.Id, galaxy);
            }
            galaxy.PlayerGameMap.Remove(player.Id);
        }

        galaxy.ActiveGames.Remove(game.Id);
    }
}