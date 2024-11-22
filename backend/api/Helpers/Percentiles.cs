public static class Percentiles
{
    public static uint Calculate(IDictionary<uint, uint> buckets, float percentile)
    {
        long totalCount = buckets.Values.Sum(v => v);
        uint cutoff = (uint)(totalCount * percentile);
        List<uint> keys = buckets.Keys.ToList();
        keys.Sort();
        uint passed = 0;
        foreach (uint key in keys)
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