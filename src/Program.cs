using System.Diagnostics;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using LightspeedTyperacing;

Server server = new();
server.StartProcessOutboxTask();
server.StartAcceptingConnections();

int millisecondsPerFrame = 1000 / 60;
Stopwatch timer = Stopwatch.StartNew();
timer.Start();
while (true)
{
    if (timer.ElapsedMilliseconds > millisecondsPerFrame)
    {
        server.Tick();
        timer.Restart();
    }
}