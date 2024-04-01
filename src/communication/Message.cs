namespace LightspeedTyping;

public abstract class Message
{
    public string SenderOrRecipientId { get; set; }

    public Message(string recipient)
    {
        SenderOrRecipientId = recipient;
    }
}