using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using Google.Protobuf;

namespace LightspeedTyperacing;

public class Server
{
    public Dictionary<string, WebSocket> Connections { get; set; }
    public Galaxy Galaxy { get; set; }
    private const int interval = 1000 / 15;
    private bool running = false;
    private Thread updateThread;
    private DateTime start = DateTime.Now;

    public Server()
    {
        Connections = new Dictionary<string, WebSocket>();
        Galaxy = new Galaxy();
        updateThread = new Thread(new ThreadStart(Run));
    }

    private void Run()
    {
        while (running)
        {
            Tick();
            var nextTick = DateTime.Now.AddMilliseconds(interval);

            int delay = (int)(nextTick - DateTime.Now).TotalMilliseconds;
            if (delay > 0)
                Thread.Sleep(delay);
        }
    }

    public void Start()
    {
        running = true;
        updateThread.Start();
    }

    public void Stop()
    {
        running = false;
    }

    public void StartProcessOutboxTask()
    {
        _ = Task.Run(async () =>
        {
            while (true)
            {
                try
                {
                    await ProcessOutbox();
                    await Task.Delay(66);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Failed to process outbox: " + ex.Message);
                }
            }
        }).ContinueWith(t =>
        {
            if (t.IsFaulted)
            {
                Console.WriteLine("Restarting ProcessOutbox task...");
                StartProcessOutboxTask();
            }
        }, TaskContinuationOptions.OnlyOnFaulted);
    }

    public void Tick()
    {
        float time_s = (float)((DateTime.Now - start).TotalMilliseconds / 1000f);
        Galaxy.Time.Update(time_s);
        Galaxy.Update();
    }

    public async void StartAcceptingConnections()
    {
        HttpListener httpListener = new();
        httpListener.Prefixes.Add("http://localhost:5000/");
        httpListener.Start();
        Console.WriteLine("Listening...");

        try
        {
            while (true)
            {
                var context = await httpListener.GetContextAsync();
                if (context.Request.IsWebSocketRequest)
                {
                    var _ = Task.Run(() => AcceptConnection(context));
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.Close();
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine("Failed to accept connection: " + e.Message);

            _ = Task.Run(() => StartAcceptingConnections());
        }
    }

    public async Task AcceptConnection(HttpListenerContext context)
    {
        WebSocketContext webSocketContext = null;
        var id = context.Request.QueryString["id"];
        if (id == null)
        {
            context.Response.StatusCode = 400;
            context.Response.Close();
            return;
        }

        try
        {
            webSocketContext = await context.AcceptWebSocketAsync(subProtocol: null);
            Connections[id] = webSocketContext.WebSocket;
            Console.WriteLine($"WebSocket connection established at {context.Request.Url}");
        }
        catch (Exception e)
        {
            context.Response.StatusCode = 500;
            context.Response.Close();
            Console.WriteLine("Exception: " + e.Message);
            return;
        }

        WebSocket webSocket = webSocketContext.WebSocket;
        _ = Task.Run(() => ListenLoop(webSocket, id));
    }

    private async void ListenLoop(WebSocket webSocket, string token)
    {
        byte[] receiveBuffer = new byte[1024];
        while (webSocket.State == WebSocketState.Open)
        {
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(receiveBuffer), CancellationToken.None);

            int messageLength = receiveResult.Count;

            if (receiveResult.MessageType == WebSocketMessageType.Binary)
            {
                // try
                // {
                using (var ms = new MemoryStream(receiveBuffer, 0, messageLength))
                {
                    OneofRequest request = OneofRequest.Parser.ParseFrom(ms);
                    HandleRequest(request);
                }
                // }
                // catch (Exception e)
                // {
                //     Console.WriteLine("Failed to parse request: " + e.Message);
                //     continue;
                // }
            }
            else if (receiveResult.MessageType == WebSocketMessageType.Close)
            {
                Api.DisconnectPlayer(token, Galaxy);
                Console.WriteLine("WebSocket connection closed by client.");
                Connections.Remove(token);
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            }
        }
    }

    public async Task ProcessOutbox()
    {
        OneofUpdate? update = Galaxy.GetUpdate();
        while (update != null)
        {
            if (Connections.ContainsKey(update.RecipientId) &&
                Connections[update.RecipientId].State == WebSocketState.Closed)
            {
                Connections.Remove(update.RecipientId);
            }

            if (
                Connections.ContainsKey(update.RecipientId) &&
                Connections[update.RecipientId].State == WebSocketState.Open)
            {
                WebSocket webSocket = Connections[update.RecipientId];
                Console.WriteLine($"Sending update to {update.RecipientId} of type {update.UpdateCase}");
                byte[] data = update.ToByteArray();
                await webSocket.SendAsync(
                    new ArraySegment<byte>(data, 0, data.Length),
                    WebSocketMessageType.Binary,
                    true,
                    CancellationToken.None);
            }

            update = Galaxy.GetUpdate();
        }
    }

    public void HandleRequest(OneofRequest request)
    {
        Console.WriteLine($"Received request of type {request.RequestCase} from {request.SenderId}");

        switch (request.RequestCase)
        {
            case OneofRequest.RequestOneofCase.FindGame:
                Api.FindGame(
                        request.FindGame.PlayerName,
                        request.SenderId,
                        request.FindGame.PlayerToken,
                        Galaxy,
                        request.FindGame.PrivateGame,
                        new HashSet<GameMode>(request.FindGame.GameModes));
                break;
            case OneofRequest.RequestOneofCase.TypeWord:
                Api.TypeWord(
                    request.TypeWord.Word,
                    request.TypeWord.KeyStrokes.ToList(),
                    request.SenderId,
                    Galaxy);
                break;
            default:
                throw new Exception("Unknown request type");
        }
    }
}