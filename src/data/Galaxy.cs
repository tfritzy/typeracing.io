using Google.Protobuf;

namespace LightspeedTyperacing;

public class Galaxy
{
    public List<Game> OpenGames { get; set; }
    public Dictionary<string, Game> ActiveGames { get; set; }
    private Queue<OneofUpdate> Outbox { get; set; }
    private Queue<OneofRequest> Inbox { get; set; }
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

    public void SendUpdate(InGamePlayer player, OneofUpdate message)
    {
        if (player.IsDisconnected)
        {
            return;
        }

        Outbox.Enqueue(message);
    }

    public OneofUpdate? GetUpdate()
    {
        if (Outbox.Count == 0)
        {
            return null;
        }

        OneofUpdate message = Outbox.Dequeue();
        return message;
    }

    public void ClearOutbox()
    {
        Outbox.Clear();
    }

    public int OutboxCount()
    {
        return Outbox.Count;
    }

    public List<OneofUpdate> OutboxMessages()
    {
        return Outbox.ToList();
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

        for (int i = 0; i < OpenGames.Count; i++)
        {
            Game game = OpenGames[i];
            OpenGames[i].Update();

            if (game.State != Game.GameState.Lobby)
            {
                i--;
            }
        }
    }
}