using LightspeedTyperacing;

Server server = new();
server.StartAcceptingConnections();

while (true)
{
    server.Update();
}