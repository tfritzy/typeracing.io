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
                            if (await HostHelpers.IsHostAlive(host))
                            {
                                await HostHelpers.DeleteHosts(container, deadHostIds);

                                var isDev =
                                    Environment.GetEnvironmentVariable("AZURE_FUNCTIONS_ENVIRONMENT") == "Development";
                                var url = isDev ? "ws://localhost" : $"wss://{host.color}.typeracing.io";
                                response = req.CreateResponse(HttpStatusCode.OK);
                                await response.WriteAsJsonAsync(new FindHostResponse(url));
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

    }
}
