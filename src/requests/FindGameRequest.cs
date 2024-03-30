namespace LightspeedTyping
{
    public class FindGameRequest
    {
        public string PlayerName { get; set; }
        public Guid PlayerId { get; set; }

        public FindGameRequest(string name, Guid id)
        {
            PlayerName = name;
            PlayerId = id;
        }
    }
}