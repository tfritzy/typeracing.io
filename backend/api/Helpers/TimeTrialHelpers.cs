using Microsoft.Azure.Cosmos;
using Schema;

public static class TimeTrialHelpers
{
    public static async Task<TimeTrialResult?> FindResultForTrial(Container container, string playerId, string trialId)
    {
        ItemResponse<TimeTrialResult> response = await container.ReadItemAsync<TimeTrialResult>(
            id: trialId,
            partitionKey: new PartitionKey(playerId)
        );
        return response?.Resource;
    }

    public static async Task<TimeTrial?> FindTrial(CosmosClient client, string trialId)
    {
        Container container = client.GetContainer(DBConst.DB, DBConst.TimeTrials);
        ItemResponse<TimeTrial> response = await container.ReadItemAsync<TimeTrial>(
            id: trialId,
            partitionKey: new PartitionKey(trialId)
        );
        return response?.Resource;
    }
}