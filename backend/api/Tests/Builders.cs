using Schema;

namespace Tests;

public static class Builders
{
    public static Player BuildAnonPlayer(int i)
    {
        return new()
        {
            Id = "plyr_00" + i,
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
            Id = "trial_00" + i,
            Name = "A tale of two cities",
            Phrase = "It was the best of times, it was the worst of times."
        };
    }

    public static TimeTrialResult BuildTimeTrialResult(TimeTrial timeTrial, string playerId)
    {
        var ks = TestHelpers.GetKeystrokesForPhrase(timeTrial.Phrase, 50);
        var result = new TimeTrialResult()
        {
            BestTime = KeystrokeHelpers.GetTime(ks),
            Id = timeTrial.Id,
            PlayerId = playerId
        };
        result.AttemptTimes.Add(KeystrokeHelpers.GetTime(ks));
        result.BestKeystrokes.Add(ks);
        return result;
    }
}