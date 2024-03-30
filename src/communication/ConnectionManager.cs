using System.Net.WebSockets;

namespace LightspeedTyping;

public class ConnectionManager
{
    public Dictionary<Guid, WebSocket> Connections { get; set; }

    public ConnectionManager()
    {
        Connections = new Dictionary<Guid, WebSocket>();
    }
}