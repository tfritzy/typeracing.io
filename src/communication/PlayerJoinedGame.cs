namespace LightspeedTyping;

public class PlayerJoinedGame : Message
{
    public string GameId { get; set; }
    public string PlayerId { get; set; }
    public string PlayerName { get; set; }

    public PlayerJoinedGame(string recipient, string gameId, string playerId, string playerName) : base(recipient)
    {
        PlayerId = playerId;
        GameId = gameId;
        PlayerName = playerName;
    }
}