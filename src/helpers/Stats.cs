namespace LightspeedTyperacing;

public static class Stats
{
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

        return wpmByCharacter;
    }

    public static List<float> GetWpmBySecond(List<float> charCompletionTimes_s)
    {
        return new List<float>();
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