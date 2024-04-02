using System.Net.WebSockets;

namespace LightspeedTyperacing;

public class ConnectionManager
{
    public Dictionary<Guid, WebSocket> Connections { get; set; }

    public ConnectionManager()
    {
        Connections = new Dictionary<Guid, WebSocket>();
    }
}