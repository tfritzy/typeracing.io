using System.Net;
using System.Net.WebSockets;
using Google.Protobuf;

namespace LightspeedTyperacing;

public class Server
{
    public Dictionary<string, WebSocket> Connections { get; set; }
    public Galaxy Galaxy { get; set; }

    public Server()
    {
        Connections = new Dictionary<string, WebSocket>();
        Galaxy = new Galaxy();
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

    public void StartTickTimer()
    {
        _ = Task.Run(async () =>
        {
            int oneFrame = 1000 / 60;
            while (true)
            {
                await Task.Delay(oneFrame);
                try
                {
                    Time.Update(oneFrame);
                    Galaxy.Update();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Failed to tick: " + ex.Message);
                }
            }
        }).ContinueWith(t =>
        {
            if (t.IsFaulted)
            {
                Console.WriteLine("Restarting Tick task...");
                StartTickTimer();
            }
        }, TaskContinuationOptions.OnlyOnFaulted);
    }

    public async Task AcceptConnection(HttpListenerContext context)
    {
        WebSocketContext webSocketContext = null;
        var token = context.Request.QueryString["token"];
        if (token == null)
        {
            context.Response.StatusCode = 400;
            context.Response.Close();
            return;
        }

        try
        {
            webSocketContext = await context.AcceptWebSocketAsync(subProtocol: null);
            Connections[token] = webSocketContext.WebSocket;
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
        _ = Task.Run(() => ListenLoop(webSocket, token));
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
                try
                {
                    using (var ms = new MemoryStream(receiveBuffer, 0, messageLength))
                    {
                        OneofRequest request = OneofRequest.Parser.ParseFrom(ms);
                        HandleRequest(request);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("Failed to parse request: " + e.Message);
                    continue;
                }
            }
            else if (receiveResult.MessageType == WebSocketMessageType.Close)
            {
                Console.WriteLine("WebSocket connection closed by client.");
                Connections.Remove(token);
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            }
        }
    }

    public async Task ProcessOutbox()
    {
        while (Galaxy.Outbox.Count > 0)
        {
            OneofUpdate update = Galaxy.Outbox.Dequeue();
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
            else
            {
                Console.WriteLine($"Failed to send update to {update.RecipientId}");
            }
        }
    }

    public void HandleRequest(OneofRequest request)
    {
        Console.WriteLine($"Received request of type {request.RequestCase} from {request.SenderId}");

        switch (request.RequestCase)
        {
            case OneofRequest.RequestOneofCase.FindGame:
                Api.FindGame(request.FindGame.PlayerName, request.SenderId, Galaxy);
                break;
            case OneofRequest.RequestOneofCase.TypeWord:
                Api.TypeWord(request.TypeWord.Word, request.SenderId, Galaxy);
                break;
            default:
                throw new Exception("Unknown request type");
        }
    }
}