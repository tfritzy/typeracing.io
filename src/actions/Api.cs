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
        openGame.Players.Add(new InGamePlayer(playerName, playerId));
        galaxy.PlayerGameMap[playerId] = openGame.Id;

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
            return;
        }

        InGamePlayer? player = game.Players.FirstOrDefault(p => p.Id == playerId);
        if (player == null)
        {
            return;
        }

        if (player.WordIndex >= game.Words.Length)
        {
            return;
        }

        if (game.Words[player.WordIndex] == word)
        {
            player.WordIndex++;

            foreach (InGamePlayer p in game.Players)
            {
                if (p.Id == playerId)
                {
                    continue;
                }

                galaxy.Outbox.Enqueue(
                    new OneofUpdate
                    {
                        RecipientId = p.Id,
                        WordFinished = new WordFinished
                        {
                            PlayerId = playerId,
                            PercentComplete = (float)player.WordIndex / game.Words.Length
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