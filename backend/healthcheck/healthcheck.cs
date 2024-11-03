using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using WebSocketSharp;

namespace Typeracing.Api
{
    public class HealthCheck
    {
        private readonly ILogger _logger;
        private static readonly HttpClient HttpClient = new HttpClient();
        private const string WebSocketUrl = "wss://api.typeracing.io:5000/?id=plyr_healthcheck";
        private const string LogicAppUrl = "https://prod-30.centralus.logic.azure.com:443/workflows/29eff023afbc47d98dbc62ef1074b3ee/triggers/scream/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fscream%2Frun&sv=1.0&sig=4Twd0_dT7DZe3MMw_s9I1zoPkbWBC3ODvG4XByZG-Zg";
        private const int WebSocketTimeoutMs = 3000;


        public HealthCheck(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<HealthCheck>();
        }

        [Function("healthcheck")]
        public async Task Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation($"C# Timer trigger function executed at: {DateTime.Now}");

            if (myTimer.ScheduleStatus is not null)
            {
                _logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus.Next}");
            }

            await TryConnectToWebSocket();
        }

        private async Task TryConnectToWebSocket()
        {
            bool opened = false;

            try
            {
                using (var ws = new WebSocket(WebSocketUrl))
                {
                    var tcs = new TaskCompletionSource<bool>();

                    ws.OnOpen += (sender, e) =>
                    {
                        _logger.LogInformation("Connected to WebSocket successfully.");
                        opened = true;
                    };

                    ws.OnError += (sender, e) =>
                    {
                        _logger.LogError($"WebSocket error: {e.Message}");
                        CallLogicApp();
                    };

                    ws.OnClose += (sender, e) =>
                    {
                        if (!opened)
                        {
                            tcs.SetResult(false);
                            _logger.LogInformation("WebSocket connection closed without successful connection.");
                            CallLogicApp();
                        }
                        else
                        {
                            tcs.SetResult(true);
                            _logger.LogInformation("WebSocket connection closed after successful connection.");
                        }
                    };

                    ws.Connect();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception while trying to connect to WebSocket: {ex.Message}");
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
