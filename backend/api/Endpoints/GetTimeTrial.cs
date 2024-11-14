using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using Google.Protobuf;

namespace api
{
    public class GetTimeTrial
    {
        private readonly CosmosClient _cosmosClient;

        public GetTimeTrial(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("time-trial")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            try
            {
                // TODO: accept id as url param

                if (!req.Query.ContainsKey("id"))
                {
                    return new BadRequestObjectResult("Missing id query param");
                }

                string? id = req.Query["id"];
                if (String.IsNullOrEmpty(id))
                {
                    return new BadRequestObjectResult("id can't be null");
                }

                var container = _cosmosClient.GetContainer(DBConst.DB, DBConst.TimeTrials);

                var listAllTrialsQuery = new QueryDefinition($"SELECT * FROM c WHERE c.id='{id}'");
                using var iterator = container.GetItemQueryIterator<TimeTrial>(listAllTrialsQuery);
                if (iterator.HasMoreResults)
                {
                    var results = await iterator.ReadNextAsync();
                    var trial = results.FirstOrDefault();

                    if (trial == null)
                    {
                        return new NotFoundObjectResult($"No trial found with id '{id}'");
                    }

                    return new ProtobufResult(trial);
                }
                else
                {
                    return new NotFoundObjectResult($"No trial found with id '{id}'");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex}");
                return new ObjectResult(new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while processing the request"
                })
                {
                    StatusCode = 500
                };
            }
        }
    }
}