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
                return new NotFoundObjectResult("Trial not found");
            }

            var container = _cosmosClient.GetContainer(DBConst.DB, DBConst.TimeTrialResults);
            TimeTrialResult? existingResult = await TimeTrialHelpers.FindResultForTrial(
                container,
                player.Id,
                trialRequest.Id);

            string typed = KeystrokeHelpers.ParseKeystrokes(trialRequest.Keystrokes);
            if (typed != trial.Phrase)
            {
                return new OkResult();
            }

            float time = KeystrokeHelpers.GetTime(trialRequest.Keystrokes);
            if (time < existingResult.BestTime)
            {
                existingResult.BestTime = time;
                existingResult.BestKeystrokes.Clear();
                existingResult.BestKeystrokes.AddRange(trialRequest.Keystrokes);
                await container.ReplaceItemAsync(
                    existingResult,
                    existingResult.Id,
                    new PartitionKey(existingResult.PlayerId)
                );
            }

            return new OkObjectResult("Score updated");
        }

        private async Task<ReportTimeTrialRequest> ValidateRequest(HttpRequest req)
        {
            ReportTimeTrialRequest? requestBody;
            try
            {
                requestBody = ReportTimeTrialRequest.Parser.ParseFrom(req.Body);
            }
            catch (Exception e)
            {
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