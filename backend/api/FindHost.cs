using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Net;
using System.Text.Json;

namespace api
{
    public class FindHost
    {
        private readonly CosmosClient _cosmosClient;
        private readonly string _databaseName = "aces";
        private readonly string _containerName = "typeracing-hosts";

        public FindHost(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("FindHost")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req)
        {
            var container = _cosmosClient.GetContainer(_databaseName, _containerName);
            var queryDefinition = new QueryDefinition("SELECT * FROM c");
            var hosts = new List<Host>();
            try
            {
                using var iterator = container.GetItemQueryIterator<Host>(queryDefinition);

                while (iterator.HasMoreResults)
                {
                    hosts.AddRange(await iterator.ReadNextAsync());
                }

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(hosts);
                return response;
            }
            catch (Exception ex)
            {
                var response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync(ex.Message);
                return response;
            }
        }
    }
}
