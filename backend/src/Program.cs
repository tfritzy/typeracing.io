using LightspeedTyperacing;

Server server = new();
server.StartProcessOutboxTask();
server.StartAcceptingConnections();

server.Start();
Console.ReadLine();
server.Stop();