namespace LightspeedTyping;

public class GameStarting : Message
{
    public float Seconds { get; set; }

    public GameStarting(Guid recipient, float seconds) : base(recipient)
    {
        Seconds = seconds;
    }
}