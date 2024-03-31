namespace LightspeedTyping;

public static class Api
{
    public static void FindGame(FindGameRequest request, Galaxy galaxy)
    {
        if (galaxy.OpenGames.Count == 0)
        {
            Game game = new(galaxy);
            galaxy.OpenGames.Add(game);
        }

        Game openGame = galaxy.OpenGames[0];
        openGame.Players.Add(new Player(request.PlayerName, request.Recipient));

        foreach (Player player in openGame.Players)
        {
            galaxy.Outbox.Enqueue(
                new PlayerJoinedGame(
                    recipient: player.Id,
                    gameId: openGame.Id,
                    playerId: request.Recipient,
                    playerName: request.PlayerName));
        }

        if (openGame.Players.Count == openGame.MaxPlayers)
        {
            galaxy.OpenGames.Remove(openGame);
            galaxy.ActiveGames.Add(openGame);

            foreach (Player player in openGame.Players)
            {
                galaxy.Outbox.Enqueue(new GameStarting(player.Id, seconds: Game.CountdownDuration));
            }
        }
    }
}