namespace LightspeedTyping;

public class PlayerCompleted : Message
{
    public string PlayerId;
    public int Place;

    public PlayerCompleted(string recipientId, string playerId, int place) : base(recipientId)
    {
        PlayerId = playerId;
        Place = place;
    }
}