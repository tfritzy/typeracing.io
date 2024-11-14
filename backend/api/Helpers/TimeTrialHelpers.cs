using Microsoft.Azure.Cosmos;
using Schema;

public static class TimeTrialHelpers
{
    public static async Task<TimeTrialResult?> FindResultForTrial(Container container, string playerId, string trialId)
    {
        try
        {
            ItemResponse<TimeTrialResult> response = await container.ReadItemAsync<TimeTrialResult>(
                id: trialId,
                partitionKey: new PartitionKey(playerId)
            );
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }
}