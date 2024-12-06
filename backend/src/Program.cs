
using typeracing.io;

Server server = new();
server.StartAcceptingConnections();

while (true)
{
    server.Update();
}