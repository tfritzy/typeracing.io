using Google.Protobuf;

namespace LightspeedTyperacing;

public class Galaxy
{
    public List<Game> OpenGames { get; set; }
    public Dictionary<string, Game> ActiveGames { get; set; }
    public Queue<OneofUpdate> Outbox { get; set; }
    public Queue<OneofRequest> Inbox { get; set; }
    public Dictionary<string, string> PlayerGameMap { get; set; }
    public Time Time { get; private set; }

    public Galaxy()
    {
        OpenGames = new List<Game>();
        ActiveGames = new Dictionary<string, Game>();
        Outbox = new Queue<OneofUpdate>();
        Inbox = new Queue<OneofRequest>();
        PlayerGameMap = new Dictionary<string, string>();
        Time = new Time();
    }

    public void Update()
    {
        lock (ActiveGames)
        {
            foreach (var game in ActiveGames.Values)
            {
                game.Update();
            }
        }
    }
}