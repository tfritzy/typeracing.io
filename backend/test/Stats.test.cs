namespace Tests;

[TestClass]
public class StatsTests
{
    [TestMethod]
    public void Stats_Wpm()
    {
        AssertExtensions.IsApproximately(0, Stats.GetWpm(new List<float>()));
        AssertExtensions.IsApproximately(12, Stats.GetWpm(new List<float> { 1 }));
        AssertExtensions.IsApproximately(12, Stats.GetWpm(new List<float> { 1, 2, 3, 4, 5 }));
        AssertExtensions.IsApproximately(60, Stats.GetWpm(new List<float> { 1, 1, 1, 1, 1 }));
    }
}