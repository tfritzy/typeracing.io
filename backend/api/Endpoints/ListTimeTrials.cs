using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api
{
    public class ListTimeTrials
    {
        private readonly CosmosClient _cosmosClient;
        private readonly string _databaseName = "aces";
        private readonly string _containerName = "time-trials";

        public ListTimeTrials(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("list-time-trials")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
        {
            try
            {
                // var requestBody = await JsonSerializer.DeserializeAsync<ListTimeTrialsRequest>(
                //     req.Body,
                //     new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                // );

                var container = _cosmosClient.GetContainer(_databaseName, _containerName);

                List<TimeTrialListItem> trials = [];
                var listAllTrialsQuery = new QueryDefinition($"SELECT * FROM c");
                using var iterator = container.GetItemQueryIterator<TimeTrial>(listAllTrialsQuery);
                while (iterator.HasMoreResults)
                {
                    foreach (TimeTrial trial in await iterator.ReadNextAsync())
                    {
                        trials.Add(new TimeTrialListItem(trial));
                    }
                }

                return new OkObjectResult(trials);
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