namespace LightspeedTyping;

public class Galaxy
{
    public List<Game> OpenGames { get; set; }
    public Queue<Message> Outbox { get; set; }
    public Queue<Message> Inbox { get; set; }

    public Galaxy()
    {
        OpenGames = new List<Game>();
        Outbox = new Queue<Message>();
        Inbox = new Queue<Message>();
    }
}