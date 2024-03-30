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

        galaxy.OpenGames[0].Players.Add(new Player(request.PlayerName, request.PlayerId));
    }
}