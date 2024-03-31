namespace LightspeedTyping;

public class GameStarted : Message
{
    public GameStarted(Guid recipient) : base(recipient)
    {
    }
}