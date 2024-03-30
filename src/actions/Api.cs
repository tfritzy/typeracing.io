namespace LightspeedTyping;

public static class Api
{
    public static void FindGame(FindGameRequest request, Galaxy galaxy)
    {
        if (galaxy.OpenGames.Count == 0)
        {
            Game game = new();
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
    }
}