namespace LightspeedTyping;

public class TypeCharacter : Message
{
    public char Character { get; set; }

    public TypeCharacter(char character, string recipient) : base(recipient)
    {
        Character = character;
        SenderOrRecipientId = recipient;
    }
}