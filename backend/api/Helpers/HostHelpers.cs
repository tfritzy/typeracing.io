using System.Net;
using System.Net.WebSockets;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

public static class HostHelpers
{
    public static async Task DeleteHosts(Container container, List<string> entryIds)
    {
        foreach (var existingId in entryIds)
        {
            try
            {
                await container.DeleteItemAsync<Host>(
                    existingId,
                    new PartitionKey("hosts")
                );
                Console.WriteLine($"Deleted existing registration with id: {existingId}");
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                Console.WriteLine($"Item {existingId} not found during deletion");
            }
        }
    }

    public static async Task<List<string>> FindExistingEntries(Container container, string color)
    {
        List<string> existingEntryIds = [];
        var existingEntriesQuery = new QueryDefinition($"SELECT * FROM c WHERE c.color='{color}'");
        using var iterator = container.GetItemQueryIterator<Host>(existingEntriesQuery);
        while (iterator.HasMoreResults)
        {
            foreach (Host existingEntry in await iterator.ReadNextAsync())
            {
                Console.WriteLine("Found existing registration for this color.");
                existingEntryIds.Add(existingEntry.id);
            }
        }

        return existingEntryIds;
    }

    public static async Task<bool> IsHostAlive(Host host)
    {
        var environment = Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_ENVIRONMENT");
        var domain = environment == "Development" ? "localhost:8080" : $"{host.color}.typeracing.io";
        string wsScheme = environment == "Development" ? "ws" : "wss";
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1));
            using var ws = new ClientWebSocket();

            ws.Options.KeepAliveInterval = TimeSpan.FromSeconds(1);
            ws.Options.SetRequestHeader("Connection", "close");

            var uri = new Uri($"{wsScheme}://{domain}/?id=plyr_matchmaker");

            return await ConnectWithTimeout(ws, uri);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Encountered error connecting to host {host.color}: {ex.Message}");
            return false;
        }
    }

    private static async Task<bool> ConnectWithTimeout(ClientWebSocket ws, Uri uri, int timeoutMs = 10000)
    {
        using var cts = new CancellationTokenSource();
        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cts.Token);
            var connectTask = ws.ConnectAsync(uri, timeoutCts.Token);
            var timeoutTask = Task.Delay(timeoutMs, timeoutCts.Token);

            var completedTask = await Task.WhenAny(connectTask, timeoutTask);
            if (completedTask == timeoutTask)
            {
                try
                {
                    await ws.CloseAsync(closeStatus: WebSocketCloseStatus.NormalClosure, "", CancellationToken.None);
                }
                catch (ObjectDisposedException)
                {
                }
                return false;
            }

            await connectTask;
            return true;
        }
        catch (Exception ex) when (ex is OperationCanceledException
                                 || ex is WebSocketException
                                 || ex is ObjectDisposedException)
        {
            return false;
        }
    }
}