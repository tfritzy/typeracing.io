using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Net;
using System.Text.Json;
using Websocket.Client;
using System.Net.WebSockets;
using Microsoft.Extensions.Logging;

namespace api
{
    public class FindHost
    {
        private readonly CosmosClient _cosmosClient;
        private readonly string _databaseName = "aces";
        private readonly string _containerName = "typeracing-hosts";
        private readonly string _websocketScheme;
        private readonly ILogger _logger;

        public FindHost(CosmosClient cosmosClient, ILoggerFactory loggerFactory)
        {
            _cosmosClient = cosmosClient;
            _websocketScheme = Environment.GetEnvironmentVariable("WebsocketScheme")!;
            _logger = loggerFactory.CreateLogger<FindHost>();
        }

        [Function("find-host")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
            HttpResponseData response;
            var container = _cosmosClient.GetContainer(_databaseName, _containerName);
            var queryDefinition = new QueryDefinition("SELECT * FROM c");
            List<string> deadHostIds = [];
            try
            {
                using var iterator = container.GetItemQueryIterator<Host>(queryDefinition);

                while (iterator.HasMoreResults)
                {
                    foreach (Host host in await iterator.ReadNextAsync())
                    {
                        try
                        {
                            if (await IsHostAlive(host))
                            {
                                await HostHelpers.DeleteHosts(container, deadHostIds);
                                response = req.CreateResponse(HttpStatusCode.OK);
                                await response.WriteAsJsonAsync(
                                    new FindHostResponse($"wss://{host.color}.typeracing.io"));
                                return response;
                            }
                            else
                            {
                                _logger.LogInformation($"{host.id} on {host.color} is dead");
                                deadHostIds.Add(host.id);
                            }
                        }
                        catch
                        {
                            continue;
                        }
                    }
                }

                _logger.LogInformation("All hosts dead. Raising 500");
                await HostHelpers.DeleteHosts(container, deadHostIds);
                response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync("Was unable to find any hosts.");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogCritical("Unexpected exception raised. " + ex);
                response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync("Something exploded");
                return response;
            }
        }
        private async Task<bool> IsHostAlive(Host host)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1));
                using var ws = new ClientWebSocket();

                ws.Options.KeepAliveInterval = TimeSpan.FromSeconds(1);
                ws.Options.SetRequestHeader("Connection", "close");

                var uri = new Uri($"{_websocketScheme}://{host.color}.typeracing.io/?id=plyr_matchmaker");

                // Connect with timeout
                var connectTask = ws.ConnectAsync(uri, cts.Token);
                if (await Task.WhenAny(connectTask, Task.Delay(1000, cts.Token)) != connectTask)
                {
                    ws.Abort();
                    return false;
                }

                return ws.State == WebSocketState.Open;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Encountered error connecting to host {host.color}: {ex.Message}");
                return false;
            }
        }
    }
}
