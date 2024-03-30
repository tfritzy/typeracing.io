namespace LightspeedTyping
{
    public class FindGameRequest : Message
    {
        public string PlayerName { get; set; }

        public FindGameRequest(string name, Guid id) : base(id)
        {
            PlayerName = name;
            Recipient = id;
        }
    }
}