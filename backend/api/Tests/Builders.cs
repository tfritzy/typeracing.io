using Schema;

namespace Tests;

public static class Builders
{
    public static Player BuildAnonPlayer(int i)
    {
        return new()
        {
            id = "plyr_00" + i,
            CreatedS = 1,
            Type = PlayerAuthType.Anonymous,
            AnonAuthInfo = new AnonAuthInfo()
            {
                AuthToken = "auth_00" + i,
                LastLoginAt = 1
            }
        };
    }

    public static TimeTrial BuildTimeTrial(int i)
    {
        return new()
        {
            id = "trial_00" + i,
            Name = "A tale of two cities",
            Phrase = "It was the best."
        };
    }

    public static TimeTrialResult BuildTimeTrialResult(TimeTrial timeTrial, string playerId)
    {
        var ks = TestHelpers.GetKeystrokesForPhrase(timeTrial.Phrase, 50);
        var result = new TimeTrialResult()
        {
            BestTime = Schema.Stats.GetTime(ks),
            id = timeTrial.id,
            PlayerId = playerId
        };
        result.AttemptTimes.Add(Schema.Stats.GetTime(ks));
        result.BestKeystrokes.Add(ks);
        return result;
    }
}