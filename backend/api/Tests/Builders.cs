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

    public static TimeTrialResult BuildTimeTrialResult(TimeTrial trial, Player player)
    {
        TimeTrialResult result = new()
        {
            Id = trial.Id,
            BestTime = 23,
            PlayerId = player.Id,
        };
        result.BestKeystrokes.Add(new KeyStroke()); // TODO: parse
        return result;
    }
}