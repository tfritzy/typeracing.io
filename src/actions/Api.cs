namespace LightspeedTyping;

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
                new PlayerJoinedGame(
                    recipient: player.Id,
                    gameId: openGame.Id,
                    playerId: playerId,
                    playerName: playerName));
        }

        if (openGame.Players.Count == openGame.MaxPlayers)
        {
            galaxy.OpenGames.Remove(openGame);
            galaxy.ActiveGames[openGame.Id] = openGame;
            openGame.State = Game.GameState.Countdown;

            foreach (InGamePlayer player in openGame.Players)
            {
                galaxy.Outbox.Enqueue(new GameStarting(player.Id, seconds: Game.CountdownDuration));
            }
        }
    }

    public static void CompleteWord(string word, string playerId, Galaxy galaxy)
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

        if (game.Words[player.WordIndex] == word)
        {
            player.WordIndex++;
        }
    }
}