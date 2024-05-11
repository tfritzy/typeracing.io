namespace LightspeedTyperacing;

public static class Stats
{
    /// <summary>
    /// Returns the WPM at each second, based on the percent of the phrase 
    /// that was completed within that second.
    /// </summary>
    public static List<float> GetRawWpmBySecond(List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0)
        {
            return new List<float>();
        }

        List<float> wpmBySecond = new();
        List<int> charCountBySecond = new();
        for (int i = 0; i < charCompletionTimes_s.Count; i++)
        {
            int second = (int)Math.Floor(charCompletionTimes_s[i]);
            while (charCountBySecond.Count <= second)
                charCountBySecond.Add(0);
            while (wpmBySecond.Count <= second)
                wpmBySecond.Add(0);

            charCountBySecond[second]++;
        }

        for (int i = 0; i < wpmBySecond.Count; i++)
        {
            if (charCountBySecond[i] == 0)
            {
                wpmBySecond[i] = 0;
                continue;
            }

            wpmBySecond[i] = GetWpm(charCountBySecond[i], 1);
        }

        for (int i = 2; i < wpmBySecond.Count; i++)
        {
            wpmBySecond[i] = (wpmBySecond[i - 2] + wpmBySecond[i - 1] + wpmBySecond[i]) / 3;
        }

        return wpmBySecond;
    }

    /// <summary>
    /// Returns the running WPM at each second, based on what percent of the
    /// phrase they had completed by that point.
    /// </summary>
    public static List<float> GetAggWpmBySecond(List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0)
        {
            return new List<float>();
        }

        List<float> aggWpmByCharacter = new();
        for (int i = 0; i < charCompletionTimes_s.Count; i++)
        {
            aggWpmByCharacter.Add(GetWpm(i + 1, charCompletionTimes_s[i]));
        }

        int target = 1;
        List<int> nearestIndexPriorWpmToSecondBounds = new();
        for (int i = 0; i < aggWpmByCharacter.Count; i++)
        {
            while (charCompletionTimes_s[i] > target)
            {
                target += 1;
                nearestIndexPriorWpmToSecondBounds.Add(Math.Max(i - 1, 0));
            }
        }

        List<float> wpmBySecond = new();
        for (int i = 0; i < nearestIndexPriorWpmToSecondBounds.Count; i++)
        {
            int second = i + 1;
            int priorI = nearestIndexPriorWpmToSecondBounds[i];
            float prevVal = aggWpmByCharacter[priorI];
            float nextVal = aggWpmByCharacter[priorI + 1];
            float priorTime = charCompletionTimes_s[priorI];
            float nextTime = charCompletionTimes_s[priorI + 1];
            float timespan = nextTime - priorTime;
            float percentAlongTimespan = (second - priorTime) / timespan;
            float lerpedWpm = prevVal + (nextVal - prevVal) * percentAlongTimespan;
            lerpedWpm = Math.Max(lerpedWpm, 0);
            wpmBySecond.Add(lerpedWpm);
        }

        float finalWpm = aggWpmByCharacter[^1];
        wpmBySecond.Add(finalWpm);

        return wpmBySecond;
    }

    public static float GetWpm(List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0)
        {
            return 0;
        }

        float end_time_s = charCompletionTimes_s[^1];
        return GetWpm(charCompletionTimes_s.Count, charCompletionTimes_s[^1]);
    }

    public static float GetWpm(int charCount, float time_s)
    {
        return charCount / time_s * 60 / 5;
    }
}