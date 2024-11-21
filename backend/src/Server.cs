using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using Google.Protobuf;
using DotNetEnv;
using Schema;
using System.Text;

namespace typeracing.io;

public class Server
{
    public Dictionary<string, WebSocket> Connections { get; set; }
    public Galaxy Galaxy { get; set; }
    private const int interval = 1000 / 15;
    private long lastTime = Environment.TickCount64;
    private float registerCountdown = RE_REGISTER_PERIOD;
    const int MaxChunkSize = 4096;
    private const float RE_REGISTER_PERIOD = 360;

    public Server()
    {
        Connections = new Dictionary<string, WebSocket>();
        Galaxy = new Galaxy();
    }

    public async void Update()
    {
        float deltaTime_s = (Environment.TickCount64 - lastTime) / 1000f;
        lastTime = Environment.TickCount64;

        Tick(deltaTime_s);
        await ProcessOutbox();
        await ReRegisterPeriodically(deltaTime_s);

        var nextTick = DateTime.Now.AddMilliseconds(interval);

        int delay = (int)(nextTick - DateTime.Now).TotalMilliseconds;
        if (delay > 0)
            Thread.Sleep(delay);
    }

    public void Tick(float deltaTime_s)
    {
        Galaxy.Time.Update(deltaTime_s);
        Galaxy.Update();
    }

    private async Task ReRegisterPeriodically(float delta_s)
    {
        registerCountdown -= delta_s;
        if (registerCountdown <= 0)
        {
            registerCountdown = RE_REGISTER_PERIOD;
            await RegisterAsHost();
        }
    }

    public async void StartAcceptingConnections()
    {
        HttpListener httpListener = new();
        string environment = Environment.GetEnvironmentVariable("ENVIRONMENT") ?? "Development";
        string envFile = environment == "Production" ? ".env.production" : ".env";
        Env.Load(envFile);

        string url = $"http://+:8080/";
        Logger.Log("Attempting to listen on " + url);
        httpListener.Prefixes.Add(url);
        httpListener.Start();
        Logger.Log("Listening on " + url);

        _ = Task.Run(() => RegisterAsHost());

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

    private async Task RegisterAsHost()
    {
        string? apiUrl = Environment.GetEnvironmentVariable("API_ADDRESS");
        if (String.IsNullOrEmpty(apiUrl))
        {
            Logger.Log("API_ADDRESS environment variable not set.");
            return;
        }

        string? apiKey = Environment.GetEnvironmentVariable("API_KEY");
        if (String.IsNullOrEmpty(apiKey))
        {
            Logger.Log("API_KEY environment variable not set.");
            return;
        }

        string? hostColor = Environment.GetEnvironmentVariable("HOST_COLOR");
        if (String.IsNullOrEmpty(hostColor))
        {
            Logger.Log("HOST_COLOR environment variable not set.");
            return;
        }

        HttpClient client = new HttpClient();
        client.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        var registerUrl = $"{apiUrl}api/register";
        var data = new { color = hostColor };
        var json = Newtonsoft.Json.JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        Logger.Log($"Attempting a registration at " + registerUrl);

        try
        {
            var response = await client.PostAsync(registerUrl, content);

            if (response.StatusCode != HttpStatusCode.OK)
            {
                Logger.Log("Failed to register due to rejection");
                Logger.Log(response.ToString());
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);
        }
        catch (HttpRequestException e)
        {
            Logger.Log("Failed to register due to error");
            Logger.Log(e.Message);
        }
    }

    public async Task AcceptConnection(HttpListenerContext context)
    {
        WebSocketContext? webSocketContext = null;
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

    private async Task ListenLoop(WebSocket webSocket, string token)
    {
        var buffer = new byte[4096];
        var messageBuffer = new MemoryStream();

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult receiveResult;
                do
                {
                    receiveResult = await webSocket.ReceiveAsync(
                        new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (receiveResult.MessageType == WebSocketMessageType.Binary)
                    {
                        await messageBuffer.WriteAsync(buffer, 0, receiveResult.Count);
                    }
                    else if (receiveResult.MessageType == WebSocketMessageType.Close)
                    {
                        Logger.Log("WebSocket connection closed by client.");
                        Api.DisconnectPlayer(token, Galaxy);
                        Connections.Remove(token);
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                        return;
                    }
                }
                while (!receiveResult.EndOfMessage);

                if (receiveResult.MessageType == WebSocketMessageType.Binary && messageBuffer.Length > 0)
                {
                    messageBuffer.Position = 0;
                    OneofRequest request = OneofRequest.Parser.ParseFrom(messageBuffer);
                    Galaxy.AddToInbox(request);
                    messageBuffer.SetLength(0);
                }
            }
        }
        catch (WebSocketException ex) when (ex.WebSocketErrorCode == WebSocketError.ConnectionClosedPrematurely)
        {
            // Normal closure.
        }
        catch (Exception e)
        {
            Logger.Log("Exception in listen loop: " + e.Message);
        }
        finally
        {
            messageBuffer?.Dispose();
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
            if (Connections.ContainsKey(update.RecipientId) &&
                Connections[update.RecipientId].State == WebSocketState.Open)
            {
                WebSocket webSocket = Connections[update.RecipientId];
                byte[] data = update.ToByteArray();

                for (int i = 0; i < data.Length; i += MaxChunkSize)
                {
                    int chunkSize = Math.Min(MaxChunkSize, data.Length - i);
                    bool isLastMessage = (i + chunkSize >= data.Length);

                    await webSocket.SendAsync(
                        new ArraySegment<byte>(data, i, chunkSize),
                        WebSocketMessageType.Binary,
                        isLastMessage,
                        CancellationToken.None);
                }
            }
            update = Galaxy.GetUpdate();
        }
    }
}