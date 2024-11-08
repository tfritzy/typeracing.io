using Microsoft.Extensions.Logging;

public static class ScreamHelper
{
    private const string LogicAppUrl = "https://prod-30.centralus.logic.azure.com:443/workflows/29eff023afbc47d98dbc62ef1074b3ee/triggers/scream/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fscream%2Frun&sv=1.0&sig=4Twd0_dT7DZe3MMw_s9I1zoPkbWBC3ODvG4XByZG-Zg";

    public static async Task CallLogicApp(HttpClient client, ILogger logger)
    {
        try
        {
            var response = await client.PostAsync(LogicAppUrl, null);
            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation("Logic App triggered successfully.");
            }
            else
            {
                logger.LogError($"Failed to trigger Logic App. Status Code: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Exception while calling Logic App: {ex.Message}");
        }
    }
}