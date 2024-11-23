public static class Percentiles
{
    public static int Calculate(IDictionary<int, int> buckets, float percentile)
    {
        long totalCount = buckets.Values.Sum(v => v);
        int cutoff = (int)(totalCount * percentile);
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
}