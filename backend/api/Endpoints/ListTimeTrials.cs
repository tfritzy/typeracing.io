using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using Google.Protobuf;
using System.Web;
using System.Security.Claims;

namespace api
{
    public class ListTimeTrials
    {
        private readonly CosmosClient _cosmosClient;
        private const int DEFAULT_PAGE_SIZE = 10;
        private const int MAX_PAGE_SIZE = 20;

        public ListTimeTrials(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("list-time-trials")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req,
            ClaimsPrincipal? claimsPrincipal)
        {
            Player? player = await PlayerHelpers.GetPlayer(_cosmosClient, req, claimsPrincipal);
            if (player == null) return new UnauthorizedResult();

            try
            {
                int pageSize = GetPageSize(req);
                string? continuationToken = req.Query["continuationToken"].ToString();

                var container = _cosmosClient.GetContainer(DB.Name, DB.TimeTrials);
                var resultsContainer = _cosmosClient.GetContainer(DB.Name, DB.TimeTrialResults);
                var response = new ListTimeTrialsResponse();

                var queryDefinition = new QueryDefinition("SELECT * FROM c");
                var queryOptions = new QueryRequestOptions
                {
                    MaxItemCount = pageSize
                };

                using FeedIterator<TimeTrial> iterator = string.IsNullOrEmpty(continuationToken)
                    ? container.GetItemQueryIterator<TimeTrial>(
                        queryDefinition,
                        requestOptions: queryOptions)
                    : container.GetItemQueryIterator<TimeTrial>(
                        queryDefinition,
                        continuationToken: continuationToken,
                        requestOptions: queryOptions);

                FeedResponse<TimeTrial> results = await iterator.ReadNextAsync();

                List<Task> embellishTasks = new();
                foreach (var trial in results)
                {
                    var trialListItem = CreateListItem(trial);
                    response.TimeTrials.Add(trialListItem);
                    embellishTasks.Add(EmbellishListItem(resultsContainer, trial, trialListItem, player.id));
                }
                await Task.WhenAll(embellishTasks);

                var responseWithHeaders = new ProtobufResult(response);

                if (results.Count == pageSize && !string.IsNullOrEmpty(results.ContinuationToken))
                {
                    responseWithHeaders.Headers["x-continuation-token"] = results.ContinuationToken;
                }

                responseWithHeaders.Headers["x-page-size"] = pageSize.ToString();
                responseWithHeaders.Headers["Access-Control-Expose-Headers"] = "x-continuation-token, x-page-size";

                return responseWithHeaders;
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
                Percentile = -1,
                Time = -1,
                Wpm = -1,
                Difficulty = trial.Difficulty
            };
        }

        private static async Task EmbellishListItem(
            Container container,
            TimeTrial trial,
            TimeTrialListItem item,
            string playerId)
        {
            Console.WriteLine($"Looking for result for {item.id} and {playerId}");
            TimeTrialResult? result = await TimeTrialHelpers.FindResultForTrial(container, playerId, item.id);
            if (result != null)
            {
                item.Time = Schema.Stats.GetTime(result.BestKeystrokes);
                item.Wpm = result.BestWpm;
                item.Percentile = Percentiles.CalculatePercentile(trial.GlobalWpm, (int)MathF.Round(result.BestWpm));
            }
        }


        private static int GetPageSize(HttpRequest req)
        {
            if (!int.TryParse(req.Query["pageSize"], out int pageSize))
            {
                pageSize = DEFAULT_PAGE_SIZE;
            }

            return Math.Min(Math.Max(1, pageSize), MAX_PAGE_SIZE);
        }
    }
}