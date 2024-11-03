using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Net;
using System.Text.Json;
using WebSocketSharp;

namespace api
{
    public class FindHost
    {
        private readonly CosmosClient _cosmosClient;
        private readonly string _databaseName = "aces";
        private readonly string _containerName = "typeracing-hosts";
        private readonly string _websocketScheme;

        public FindHost(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
            _websocketScheme = Environment.GetEnvironmentVariable("WebsocketScheme")!;
        }

        [Function("find-host")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
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
                            if (IsHostAlive(host))
                            {
                                await HostHelpers.DeleteHosts(container, deadHostIds);
                                var response = req.CreateResponse(HttpStatusCode.OK);
                                await response.WriteAsJsonAsync(new FindHostResponse(host.ip));
                                return response;
                            }
                            else
                            {
                                Console.WriteLine($"{host.id} on {host.ip} is dead");
                                deadHostIds.Add(host.id);
                            }
                        }
                        catch
                        {
                            continue;
                        }
                    }
                }

                await HostHelpers.DeleteHosts(container, deadHostIds);
                return req.CreateResponse(HttpStatusCode.InternalServerError);
            }
            catch (Exception ex)
            {
                var response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync(ex.Message);
                return response;
            }
        }

        private bool IsHostAlive(Host host)
        {
            bool success = false;
            try
            {
                using (var ws = new WebSocket($"{_websocketScheme}://{host.ip}:4999/?id=plyr_matchmaker"))
                {
                    ws.OnOpen += (sender, e) =>
                    {
                        success = true;
                        ws.Close();
                    };

                    ws.OnError += (sender, e) =>
                    {
                        success = false;
                        ws.Close();
                    };

                    ws.Connect();
                }
            }
            catch
            {
                Console.WriteLine("Encountered error connecting to host: " + host.ip);
                return false;
            }

            return success;
        }
    }
}
