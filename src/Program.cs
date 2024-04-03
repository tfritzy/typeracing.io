using System.Net;
using System.Net.WebSockets;
using System.Text;
using LightspeedTyperacing;

var httpListener = new HttpListener();
httpListener.Prefixes.Add("http://localhost:5000/");
httpListener.Start();
Console.WriteLine("Listening...");

Server server = new Server();

while (true)
{
    var context = await httpListener.GetContextAsync();
    if (context.Request.IsWebSocketRequest)
    {
        var _ = Task.Run(() => server.AcceptConnection(context));
    }
    else
    {
        context.Response.StatusCode = 400;
        context.Response.Close();
    }
}