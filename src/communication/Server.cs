using System.Net;
using System.Net.WebSockets;

namespace LightspeedTyperacing;

public class Server
{
    public Dictionary<Guid, WebSocket> Connections { get; set; }
    public Galaxy Galaxy { get; set; }

    public Server()
    {
        Connections = new Dictionary<Guid, WebSocket>();
        Galaxy = new Galaxy();
    }

    public async Task AcceptConnection(HttpListenerContext context)
    {
        WebSocketContext webSocketContext = null;
        try
        {
            webSocketContext = await context.AcceptWebSocketAsync(subProtocol: null);
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
        _ = Task.Run(() => ListenLoop(webSocket));
    }

    private async void ListenLoop(WebSocket webSocket)
    {
        byte[] receiveBuffer = new byte[1024];
        while (webSocket.State == WebSocketState.Open)
        {
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(receiveBuffer), CancellationToken.None);

            Console.WriteLine($"Received message of type {receiveResult.MessageType}");

            if (receiveResult.MessageType == WebSocketMessageType.Text)
            {
                try
                {
                    OneofRequest request = OneofRequest.Parser.ParseFrom(receiveBuffer);
                    HandleRequest(request);
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
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            }
        }
    }

    public void HandleRequest(OneofRequest request)
    {
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