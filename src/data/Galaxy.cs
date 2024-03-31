namespace LightspeedTyping;

public class Galaxy
{
    public List<Game> OpenGames { get; set; }
    public List<Game> ActiveGames { get; set; }
    public Queue<Message> Outbox { get; set; }
    public Queue<Message> Inbox { get; set; }

    public Galaxy()
    {
        OpenGames = new List<Game>();
        ActiveGames = new List<Game>();
        Outbox = new Queue<Message>();
        Inbox = new Queue<Message>();
    }

    public void Update()
    {
        foreach (Game game in ActiveGames)
        {
            game.Update();
        }
    }
}