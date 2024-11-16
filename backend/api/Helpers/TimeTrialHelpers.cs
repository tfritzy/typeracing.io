using System.Net;
using Microsoft.Azure.Cosmos;
using Schema;

public static class TimeTrialHelpers
{
    public static async Task<TimeTrialResult?> FindResultForTrial(Container container, string playerId, string trialId)
    {
        try
        {
            return await container.ReadItemAsync<TimeTrialResult>(
                id: trialId,
                partitionKey: new PartitionKey(playerId)
            );
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public static async Task<TimeTrial?> FindTrial(CosmosClient client, string trialId)
    {
        Container container = client.GetContainer(DB.Name, DB.TimeTrials);
        try
        {
            return await container.ReadItemAsync<TimeTrial>(
                id: trialId,
                partitionKey: new PartitionKey(trialId)
            );
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }
}