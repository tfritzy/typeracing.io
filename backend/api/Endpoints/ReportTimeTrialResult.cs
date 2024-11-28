using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Schema;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System.Buffers;
using Newtonsoft.Json;

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
            Console.WriteLine($"Player typed: '{typed}'");
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
            TimeTrialResult? result = await TimeTrialHelpers.FindResultForTrial(
                container,
                player.id,
                trialRequest.id);

            float priorBestWpm = result?.BestWpm ?? 0;
            float priorBestTime = priorBestWpm != 0 ?
                Schema.Stats.WpmToTime(priorBestWpm, trial.Resource.Phrase.Length) :
                0;

            if (result == null)
            {
                result = new TimeTrialResult()
                {
                    id = trial.Resource.id,
                    PlayerId = player.id,
                    BestWpm = wpm,
                };
                result.BestKeystrokes.Add(keystrokes);
                result.AttemptWpms.Add(wpm);
                await container.CreateItemAsync(
                    result,
                   new PartitionKey(result.PlayerId)
               );
            }
            else
            {
                result.AttemptWpms.Add(wpm);
                if (wpm > result.BestWpm)
                {
                    result.BestWpm = wpm;
                    result.BestKeystrokes.Clear();
                    result.BestKeystrokes.AddRange(keystrokes);
                }
                await container.ReplaceItemAsync(
                    result,
                    result.id,
                    new PartitionKey(result.PlayerId)
                );
            }

            float duration = Schema.Stats.GetTime(keystrokes);
            ReportTimeTrialResponse response = new()
            {
                Time = duration,
                Wpm = Schema.Stats.GetWpm(typed.Length, duration),
                Percentile = Percentiles.CalculatePercentile(trial.Resource.GlobalWpm, (int)MathF.Round(wpm)),

                BestRunTime = priorBestTime,
                BestRunWpm = priorBestWpm,

                P99Time = Schema.Stats.WpmToTime(
                    Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .99f),
                    trial.Resource.Phrase.Length),
                P90Time = Schema.Stats.WpmToTime(
                    Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .90f),
                    trial.Resource.Phrase.Length),
                P50Time = Schema.Stats.WpmToTime(
                    Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .50f),
                    trial.Resource.Phrase.Length),
                P25Time = Schema.Stats.WpmToTime(
                    Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .25f),
                    trial.Resource.Phrase.Length),
                P99Wpm = Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .99f),
                P90Wpm = Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .90f),
                P50Wpm = Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .50f),
                P25Wpm = Percentiles.CalculateValueFromPercentile(trial.Resource.GlobalWpm, .25f),
            };
            response.GlobalTimes.Add(GetGlobalTimes(trial.Resource.GlobalWpm, trial.Resource.Phrase.Length));
            response.GlobalWpm.Add(trial.Resource.GlobalWpm);
            response.RawWpmBySecond.Add(Stats.GetRawWpmBySecond(keystrokes));
            response.WpmBySecond.Add(Stats.GetAggWpmBySecond(keystrokes));
            response.ErrorsAtTime.Add(Stats.GetErrorCountByTime(keystrokes, trial.Resource.Phrase));

            return new ProtobufResult(response);
        }

        private void AddTimeToGlobalStats(IDictionary<int, int> globalWpm, float wpm)
        {
            int index = (int)MathF.Round(wpm);
            if (!globalWpm.ContainsKey(index))
            {
                globalWpm[index] = 0;
            }

            globalWpm[index] += 1;
        }

        private Dictionary<string, int> GetGlobalTimes(IDictionary<int, int> globalWpm, int phraseLength)
        {
            var times = new Dictionary<string, int>();
            foreach (int wpm in globalWpm.Keys)
            {
                string time = ((int)Schema.Stats.WpmToTime(wpm, phraseLength)).ToString();
                if (!times.ContainsKey(time))
                {
                    times[time] = 0;
                }

                times[time] += globalWpm[wpm];
            }

            return times;
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