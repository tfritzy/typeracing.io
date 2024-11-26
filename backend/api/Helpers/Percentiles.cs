public static class Percentiles
{
    public static int CalculateValueFromPercentile(IDictionary<int, int> buckets, float percentile)
    {
        long totalCount = buckets.Values.Sum(v => v);
        float cutoff = totalCount * percentile;
        List<int> keys = buckets.Keys.ToList();
        keys.Sort();
        int passed = 0;
        foreach (int key in keys)
        {
            passed += buckets[key];
            if (passed >= cutoff)
            {
                return key;
            }
        }

        throw new InvalidOperationException("It should be impossible not to find a percentile");
    }

    public static float CalculatePercentile(IDictionary<int, int> buckets, int value)
    {
        long totalCount = buckets.Values.Sum(v => v);
        List<int> keys = buckets.Keys.ToList();
        keys.Sort();
        int passed = 0;
        foreach (int key in keys)
        {
            if (key >= value)
            {
                if (key == value)
                {
                    passed += buckets[key];
                }

                return (float)passed / totalCount;
            }

            passed += buckets[key];
        }

        return (float)passed / totalCount;
    }
}