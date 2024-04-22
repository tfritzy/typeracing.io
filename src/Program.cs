using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using LightspeedTyperacing;

Server server = new();
server.StartProcessOutboxTask();
server.StartAcceptingConnections();

server.Run();
Console.ReadLine();
server.Stop();