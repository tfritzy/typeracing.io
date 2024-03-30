namespace LightspeedTyping;

public class PlayerJoinedGame : Message
{
    public Guid GameId { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; }

    public PlayerJoinedGame(Guid recipient, Guid gameId, Guid playerId, string playerName) : base(recipient)
    {
        PlayerId = playerId;
        GameId = gameId;
        PlayerName = playerName;
    }
}