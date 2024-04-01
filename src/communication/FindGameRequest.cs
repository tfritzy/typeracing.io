namespace LightspeedTyping
{
    public class FindGameRequest : Message
    {
        public string PlayerName { get; set; }

        public FindGameRequest(string name, string id) : base(id)
        {
            PlayerName = name;
            SenderOrRecipientId = id;
        }
    }
}