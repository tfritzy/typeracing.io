using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using Google.Protobuf;

namespace api
{
    public class ListTimeTrials
    {
        private readonly CosmosClient _cosmosClient;

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
                var container = _cosmosClient.GetContainer(DB.Name, DB.TimeTrials);

                ListTimeTrialsResponse trials = new ListTimeTrialsResponse();
                var listAllTrialsQuery = new QueryDefinition($"SELECT * FROM c");
                using var iterator = container.GetItemQueryIterator<TimeTrial>(listAllTrialsQuery);
                while (iterator.HasMoreResults)
                {
                    foreach (TimeTrial trial in await iterator.ReadNextAsync())
                    {
                        trials.TimeTrials.Add(CreateListItem(trial));
                    }
                }

                return new ProtobufResult(trials);
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

        private static TimeTrialListItem CreateListItem(TimeTrial trial)
        {
            return new TimeTrialListItem
            {
                id = trial.id,
                Length = trial.Phrase.Split(" ").Length,
                Name = trial.Name,
                Place = -1,
                Time = -1
            };
        }
    }
}