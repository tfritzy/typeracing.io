using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Typeracing.Api
{
    public class Healthcheck
    {
        private readonly ILogger _logger;
        private static readonly HttpClient HttpClient = new HttpClient();
        private const string LogicAppUrl = "https://prod-30.centralus.logic.azure.com:443/workflows/29eff023afbc47d98dbc62ef1074b3ee/triggers/scream/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fscream%2Frun&sv=1.0&sig=4Twd0_dT7DZe3MMw_s9I1zoPkbWBC3ODvG4XByZG-Zg";
        private readonly HttpClient _httpClient;

        public Healthcheck(ILoggerFactory loggerFactory, HttpClient httpClient)
        {
            _logger = loggerFactory.CreateLogger<Healthcheck>();
            _httpClient = httpClient;
        }

        [Function("healthcheck")]
        public async Task Run([TimerTrigger("0 */2 * * * *")] TimerInfo timerInfo)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

            var targetUrl = FunctionUrlHelper.GetFunctionUrl("find-host");
            try
            {
                var response = await _httpClient.GetAsync(targetUrl);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Successfully called find-host. Response: {Result}", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling target function");
                await CallLogicApp();
                throw;
            }
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
