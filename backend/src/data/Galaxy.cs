using Google.Protobuf;
using Schema;

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

    public void SendUpdate(InGamePlayer player, string gameId, OneofUpdate message)
    {
        if (player.IsDisconnected)
        {
            return;
        }

        if (!PlayerGameMap.ContainsKey(player.Id) || PlayerGameMap[player.Id] != gameId)
        {
            return;
        }

        if (player.BotConfig != null)
        {
            return;
        }

        message.RecipientId = player.Id;
        message.GameId = gameId;

        Logger.Log($"Enqueued update of type {message.UpdateCase} to {player.Id}");
        Outbox.Enqueue(message);
    }

    private InGamePlayer? FindPlayer(string id)
    {
        if (!PlayerGameMap.ContainsKey(id))
        {
            return null;
        }

        string gameId = PlayerGameMap[id];
        Game? game;
        if (ActiveGames.ContainsKey(gameId))
        {
            game = ActiveGames[gameId];
        }
        else
        {
            game = OpenGames.Find(game => game.Id == gameId);
        }

        if (game == null)
        {
            return null;
        }

        return game.Players.Find(player => player.Id == id);
    }

    public void AddToInbox(OneofRequest message)
    {
        InGamePlayer? player = FindPlayer(message.SenderId);
        if (player != null)
        {
            player.LastSeen = Time.Now;
        }

        Inbox.Enqueue(message);
    }

    private void ProcessInbox()
    {
        while (Inbox.Count > 0)
        {
            OneofRequest message = Inbox.Dequeue();
            try
            {
                HandleRequest(message);
            }
            catch (Exception e)
            {
                Logger.Log($"Error handling request: {e.Message}");
            }
        }
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

        ProcessInbox();
    }

    private void HandleRequest(OneofRequest request)
    {
        Logger.Log($"Received request of type {request.RequestCase} from {request.SenderId}");

        switch (request.RequestCase)
        {
            case OneofRequest.RequestOneofCase.FindGame:
                Api.FindGame(
                    request.FindGame.PlayerName,
                    request.SenderId,
                    request.SenderToken,
                    this,
                    request.FindGame.PrivateGame,
                    new HashSet<GameMode>(request.FindGame.GameModes));
                break;
            case OneofRequest.RequestOneofCase.TypeWord:
                Api.TypeWord(
                    request.TypeWord.KeyStrokes.ToList(),
                    request.SenderId,
                    request.SenderToken,
                    this);
                break;
            default:
                throw new Exception("Unknown request type");
        }
    }
}