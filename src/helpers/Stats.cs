namespace LightspeedTyperacing;

public static class Stats
{
    /// <summary>
    /// Returns the WPM at each second, based on the percent of the phrase 
    /// that was completed within that second.
    /// </summary>
    public static List<float> GetRawWpmBySecond(string phrase, List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0 || charCompletionTimes_s.Count != phrase.Length)
        {
            return new List<float>();
        }

        int numWords = phrase.Split(' ').Length;
        List<float> wpmByCharacter = new();
        for (int i = 0; i < charCompletionTimes_s.Count; i++)
        {
            float percentComplete = (float)(i + 1) / charCompletionTimes_s.Count;
            float numWordsTyped = numWords * percentComplete;
            float wpm = numWordsTyped / charCompletionTimes_s[i] * 60;
            wpmByCharacter.Add(wpm);
        }

        List<float> wpmBySecond = new();
        List<int> charCountBySecond = new();
        for (int i = 0; i < wpmByCharacter.Count; i++)
        {
            int second = (int)Math.Floor(charCompletionTimes_s[i]);
            while (charCountBySecond.Count <= second)
                charCountBySecond.Add(0);
            while (wpmBySecond.Count <= second)
                wpmBySecond.Add(0);

            wpmBySecond[second] += wpmByCharacter[i];
            charCountBySecond[second]++;
        }

        for (int i = 0; i < wpmBySecond.Count; i++)
        {
            if (charCountBySecond[i] == 0)
            {
                wpmBySecond[i] = 0;
                continue;
            }

            wpmBySecond[i] /= charCountBySecond[i];
        }

        return wpmBySecond;
    }

    /// <summary>
    /// Returns the running WPM at each second, based on what percent of the
    /// phrase they had completed by that point.
    /// </summary>
    public static List<float> GetAggWpmBySecond(string phrase, List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0 || charCompletionTimes_s.Count != phrase.Length)
        {
            return new List<float>();
        }

        int numWords = phrase.Split(" ").Length;
        List<float> aggWpmByCharacter = new();
        for (int i = 0; i < charCompletionTimes_s.Count; i++)
        {
            float percentComplete = (i + 1) / (float)phrase.Length;
            float wordsTyped = percentComplete * numWords;
            float wpm = wordsTyped / charCompletionTimes_s[i] * 60;
            aggWpmByCharacter.Add(wpm);
        }

        int target = 1;
        List<int> nearestIndexPriorWpmToSecondBounds = new();
        for (int i = 0; i < aggWpmByCharacter.Count; i++)
        {
            while (charCompletionTimes_s[i] > target)
            {
                target += 1;
                nearestIndexPriorWpmToSecondBounds.Add(i - 1);
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
            wpmBySecond.Add(lerpedWpm);
        }

        float finalWpm = aggWpmByCharacter[^1];
        wpmBySecond.Add(finalWpm);

        return wpmBySecond;
    }

    public static float GetWpm(int numWords, List<float> charCompletionTimes_s)
    {
        if (charCompletionTimes_s.Count == 0)
        {
            return 0;
        }

        float end_time_s = charCompletionTimes_s[^1];
        return numWords / end_time_s * 60;
    }
}