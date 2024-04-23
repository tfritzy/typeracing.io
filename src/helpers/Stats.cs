namespace LightspeedTyperacing;

public static class Stats
{
    public static List<float> GetRawWpmBySecond(List<float> charCompletionTimes_s)
    {
        return new List<float>();
    }

    public static List<float> GetWpmBySecond(List<float> charCompletionTimes_s)
    {
        return new List<float>();
    }

    public static float GetWpm(int numWords, float time_s)
    {
        return numWords / time_s * 60;
    }
}