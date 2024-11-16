using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using System.Security.Claims;
using Microsoft.Azure.Cosmos.Core;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;
using System.Buffers;

namespace api
{
    public class ReportTimeTrialResult
    {
        private readonly CosmosClient _cosmosClient;

        public ReportTimeTrialResult(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("time-trial-result")]
        public async Task<IStatusCodeActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req,
            ClaimsPrincipal? claimsPrincipal)
        {
            Player? player = await PlayerHelpers.GetPlayer(_cosmosClient, req, claimsPrincipal);
            if (player == null) return new UnauthorizedResult();

            ReportTimeTrialRequest trialRequest;
            try
            {
                trialRequest = await ValidateRequest(req);
            }
            catch (BadHttpRequestException e)
            {
                return new BadRequestObjectResult(e.Message);
            }

            TimeTrial? trial = await TimeTrialHelpers.FindTrial(
                _cosmosClient,
                trialRequest.Id);

            if (trial == null)
            {
                Console.WriteLine($"Could not find trial for {trialRequest.Id}");
                return new NotFoundObjectResult("Trial not found");
            }

            string typed = KeystrokeHelpers.ParseKeystrokes(trialRequest.Keystrokes);
            Console.WriteLine($"Player typed: {typed}");
            if (typed != trial.Phrase)
            {
                Console.WriteLine($"Typed doesn't look right. Bailing.");
                return new OkResult();
            }

            var container = _cosmosClient.GetContainer(DB.Name, DB.TimeTrialResults);
            TimeTrialResult? existingResult = await TimeTrialHelpers.FindResultForTrial(
                container,
                player.Id,
                trialRequest.Id);

            float time = KeystrokeHelpers.GetTime(trialRequest.Keystrokes);
            if (existingResult == null)
            {
                TimeTrialResult result = new TimeTrialResult()
                {
                    Id = trial.Id,
                    PlayerId = player.Id,
                    BestTime = time,
                };
                result.BestKeystrokes.Add(trialRequest.Keystrokes);
                result.AttemptTimes.Add(time);
                await container.CreateItemAsync(
                    DB.FormatProto(result),
                   new PartitionKey(result.PlayerId)
               );
            }
            else
            {
                existingResult.AttemptTimes.Add(KeystrokeHelpers.GetTime(trialRequest.Keystrokes));
                if (time < existingResult.BestTime)
                {
                    existingResult.BestTime = time;
                    existingResult.BestKeystrokes.Clear();
                    existingResult.BestKeystrokes.AddRange(trialRequest.Keystrokes);
                }
                await container.ReplaceItemAsync(
                    DB.FormatProto(existingResult),
                    existingResult.Id,
                    new PartitionKey(existingResult.PlayerId)
                );
            }

            float duration = KeystrokeHelpers.GetTime(trialRequest.Keystrokes);
            ReportTimeTrialResponse response = new()
            {
                Time = duration,
                Wpm = KeystrokeHelpers.GetWpm(typed.Length, duration)
            };

            return new ProtobufResult(response);
        }

        private async Task<ReportTimeTrialRequest> ValidateRequest(HttpRequest req)
        {
            ReportTimeTrialRequest? requestBody;
            try
            {
                var result = await req.BodyReader.ReadAsync();
                requestBody = ReportTimeTrialRequest.Parser.ParseFrom(result.Buffer.ToArray());
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                throw new BadHttpRequestException("Invalid request body");
            }

            if (requestBody == null)
            {
                throw new BadHttpRequestException("Missing request body");
            }

            if (string.IsNullOrEmpty(requestBody.Id))
            {
                throw new BadHttpRequestException("Missing trial id");
            }

            if (requestBody.Keystrokes.Count == 0)
            {
                throw new BadHttpRequestException("Missing keystrokes");
            }

            return requestBody;
        }
    }
}