namespace LightspeedTyping;

public abstract class Message
{
    public Guid Recipient { get; set; }

    public Message(Guid recipient)
    {
        Recipient = recipient;
    }
}