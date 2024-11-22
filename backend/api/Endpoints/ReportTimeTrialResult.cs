using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Infrastructure;
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

            Container trialContainer = _cosmosClient.GetContainer(DB.Name, DB.TimeTrials);
            ItemResponse<TimeTrial>? trial = await TimeTrialHelpers.FindTrial(
                trialContainer,
                trialRequest.id);

            if (trial == null)
            {
                Console.WriteLine($"Could not find trial for {trialRequest.id}");
                return new NotFoundObjectResult("Trial not found");
            }

            List<KeyStroke> keystrokes = trialRequest.Keystrokes!.ToList();
            string typed = Schema.Stats.ParseKeystrokes(keystrokes);
            Console.WriteLine($"Player typed: {typed}");
            if (typed != trial.Resource.Phrase)
            {
                Console.WriteLine($"Typed doesn't look right. Bailing.");
                return new OkResult();
            }

            float time = Schema.Stats.GetTime(keystrokes);
            float wpm = Schema.Stats.GetWpm(keystrokes);
            AddTimeToGlobalStats(trial.Resource.GlobalWpm, wpm);
            ItemRequestOptions options = new ItemRequestOptions { IfMatchEtag = trial.ETag };
            await trialContainer.ReplaceItemAsync(trial.Resource, trial.Resource.id, new PartitionKey(trial.Resource.id), options);

            var container = _cosmosClient.GetContainer(DB.Name, DB.TimeTrialResults);
            TimeTrialResult? existingResult = await TimeTrialHelpers.FindResultForTrial(
                container,
                player.id,
                trialRequest.id);

            if (existingResult == null)
            {
                TimeTrialResult result = new TimeTrialResult()
                {
                    id = trial.Resource.id,
                    PlayerId = player.id,
                    BestTime = time,
                };
                result.BestKeystrokes.Add(keystrokes);
                result.AttemptTimes.Add(time);
                await container.CreateItemAsync(
                    result,
                   new PartitionKey(result.PlayerId)
               );
            }
            else
            {
                existingResult.AttemptTimes.Add(Schema.Stats.GetTime(keystrokes));
                if (time < existingResult.BestTime)
                {
                    existingResult.BestTime = time;
                    existingResult.BestKeystrokes.Clear();
                    existingResult.BestKeystrokes.AddRange(keystrokes);
                }
                await container.ReplaceItemAsync(
                    existingResult,
                    existingResult.id,
                    new PartitionKey(existingResult.PlayerId)
                );
            }

            float duration = Schema.Stats.GetTime(keystrokes);
            ReportTimeTrialResponse response = new()
            {
                Time = duration,
                Wpm = Schema.Stats.GetWpm(typed.Length, duration),
            };
            response.GlobalTimes.Add(trial.Resource.GlobalWpm);
            response.RawWpmBySecond.Add(Stats.GetRawWpmBySecond(keystrokes));
            response.WpmBySecond.Add(Stats.GetAggWpmBySecond(keystrokes));
            response.ErrorsAtTime.Add(Stats.GetErrorCountByTime(keystrokes, trial.Resource.Phrase));
            response.P99Time = Schema.Stats.WpmToTime(
                    Percentiles.Calculate(trial.Resource.GlobalWpm, .99f),
                    trial.Resource.Phrase.Length);
            response.P90Time = Schema.Stats.WpmToTime(
                    Percentiles.Calculate(trial.Resource.GlobalWpm, .90f),
                    trial.Resource.Phrase.Length);
            response.P50Time = Schema.Stats.WpmToTime(
                    Percentiles.Calculate(trial.Resource.GlobalWpm, .50f),
                    trial.Resource.Phrase.Length);
            response.P25Time = Schema.Stats.WpmToTime(
                    Percentiles.Calculate(trial.Resource.GlobalWpm, .25f),
                    trial.Resource.Phrase.Length);

            return new ProtobufResult(response);
        }

        private void AddTimeToGlobalStats(IDictionary<uint, uint> globalWpm, float wpm)
        {
            uint index = (uint)wpm;
            if (!globalWpm.ContainsKey(index))
            {
                globalWpm[index] = 0;
            }

            globalWpm[index] += 1;
        }

        private async Task<ReportTimeTrialRequest> ValidateRequest(HttpRequest req)
        {
            ReportTimeTrialRequest? requestBody;
            try
            {
                var result = await req.BodyReader.ReadAsync();
                Console.WriteLine(result);
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

            if (string.IsNullOrEmpty(requestBody.id))
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