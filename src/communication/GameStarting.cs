namespace LightspeedTyping;

public class GameStarting : Message
{
    public float Seconds { get; set; }

    public GameStarting(string senderOrRecipient, float seconds) : base(senderOrRecipient)
    {
        Seconds = seconds;
    }
}