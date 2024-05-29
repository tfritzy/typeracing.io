using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using Google.Protobuf;
using DotNetEnv;

namespace LightspeedTyperacing;

public class Server
{
    public Dictionary<string, WebSocket> Connections { get; set; }
    public Galaxy Galaxy { get; set; }
    private const int interval = 1000 / 15;
    private bool running = false;
    private DateTime start = DateTime.Now;

    public Server()
    {
        Connections = new Dictionary<string, WebSocket>();
        Galaxy = new Galaxy();
    }

    public async void Update()
    {
        Tick();
        await ProcessOutbox();

        var nextTick = DateTime.Now.AddMilliseconds(interval);

        int delay = (int)(nextTick - DateTime.Now).TotalMilliseconds;
        if (delay > 0)
            Thread.Sleep(delay);
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
        string environment = Environment.GetEnvironmentVariable("ENVIRONMENT") ?? "Development";
        string envFile = environment == "Production" ? ".env.production" : ".env";
        Env.Load(envFile);

        string? url = Environment.GetEnvironmentVariable("HOSTED_ADDRESS");
        if (String.IsNullOrEmpty(url))
        {
            throw new Exception("HOSTED_ADDRESS environment variable not set.");
        }

        httpListener.Prefixes.Add(url);
        httpListener.Start();
        Logger.Log("Listening on " + url);

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
            Logger.Log("Failed to accept connection: " + e.Message);

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
            Logger.Log($"WebSocket connection established at {context.Request.Url}");
        }
        catch (Exception e)
        {
            context.Response.StatusCode = 500;
            context.Response.Close();
            Logger.Log("Exception: " + e.Message);
            return;
        }

        WebSocket webSocket = webSocketContext.WebSocket;
        _ = Task.Run(() => ListenLoop(webSocket, id));
    }

    private async void ListenLoop(WebSocket webSocket, string token)
    {
        try
        {
            byte[] receiveBuffer = new byte[1024];
            while (webSocket.State == WebSocketState.Open)
            {
                var receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(receiveBuffer), CancellationToken.None);

                int messageLength = receiveResult.Count;

                if (receiveResult.MessageType == WebSocketMessageType.Binary)
                {
                    using (var ms = new MemoryStream(receiveBuffer, 0, messageLength))
                    {
                        OneofRequest request = OneofRequest.Parser.ParseFrom(ms);
                        Galaxy.AddToInbox(request);
                    }
                }
                else if (receiveResult.MessageType == WebSocketMessageType.Close)
                {
                    Logger.Log("WebSocket connection closed by client.");
                    Api.DisconnectPlayer(token, Galaxy);
                    Connections.Remove(token);
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                }
            }
        }
        catch (Exception e)
        {
            Logger.Log("Exception in listen loop: " + e.Message);
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
                Logger.Log($"Sending update to {update.RecipientId} of type {update.UpdateCase}");
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
}