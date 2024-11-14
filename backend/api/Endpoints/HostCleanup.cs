using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Typeracing.Api
{
    public class HostCleanup
    {
        private readonly ILogger _logger;
        private static readonly HttpClient HttpClient = new HttpClient();
        private const string WebSocketUrl = "wss://blue.typeracing.io/?id=plyr_hostcleanup";
        private const string LogicAppUrl = "https://prod-30.centralus.logic.azure.com:443/workflows/29eff023afbc47d98dbc62ef1074b3ee/triggers/scream/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fscream%2Frun&sv=1.0&sig=4Twd0_dT7DZe3MMw_s9I1zoPkbWBC3ODvG4XByZG-Zg";
        private readonly CosmosClient _cosmosClient;
        private const int WebSocketTimeoutMs = 3000;

        public HostCleanup(ILoggerFactory loggerFactory, CosmosClient cosmosClient)
        {
            _logger = loggerFactory.CreateLogger<HostCleanup>();
            _cosmosClient = cosmosClient;
        }

        [Function("host-cleanup")]
        public async Task Run([TimerTrigger("0 */15 * * * *")] TimerInfo timerInfo)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

            if (timerInfo.ScheduleStatus is not null)
            {
                _logger.LogInformation($"Next timer schedule at: {timerInfo.ScheduleStatus.Next}");
            }

            List<string> toDelete = [];
            var container = _cosmosClient.GetContainer(DBConst.DB, DBConst.Hosts);
            var allHostsQuery = new QueryDefinition($"SELECT * FROM c");
            using var iterator = container.GetItemQueryIterator<Host>(allHostsQuery);
            while (iterator.HasMoreResults)
            {
                foreach (Host host in await iterator.ReadNextAsync())
                {
                    if (!await HostHelpers.IsHostAlive(host))
                    {
                        if (!await HostHelpers.IsHostAlive(host))
                        {
                            toDelete.Add(host.id);
                        }
                    }
                }
            }

            await HostHelpers.DeleteHosts(container, toDelete);
        }

        private async Task CallLogicApp()
        {
            try
            {
                var response = await HttpClient.PostAsync(LogicAppUrl, null);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Logic App triggered successfully.");
                }
                else
                {
                    _logger.LogError($"Failed to trigger Logic App. Status Code: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception while calling Logic App: {ex.Message}");
            }
        }
    }
}
