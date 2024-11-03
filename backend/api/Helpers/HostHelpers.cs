using System.Net;
using Microsoft.Azure.Cosmos;

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

    public static async Task<List<string>> FindExistingEntries(Container container, string clientIp)
    {
        List<string> existingEntryIds = [];
        var existingEntriesQuery = new QueryDefinition($"SELECT * FROM c WHERE c.ip='{clientIp}'");
        using var iterator = container.GetItemQueryIterator<Host>(existingEntriesQuery);
        while (iterator.HasMoreResults)
        {
            foreach (Host existingEntry in await iterator.ReadNextAsync())
            {
                Console.WriteLine("Found existing registration for this ip.");
                existingEntryIds.Add(existingEntry.id);
            }
        }

        return existingEntryIds;
    }
}