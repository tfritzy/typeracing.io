namespace Tests;

[TestClass]
public class StatsTests
{
    [TestMethod]
    public void Stats_Wpm()
    {
        AssertExtensions.IsApproximately(0, Stats.GetWpm(0, new List<float>()));
        AssertExtensions.IsApproximately(0, Stats.GetWpm(0, new List<float> { 1 }));
        AssertExtensions.IsApproximately(30, Stats.GetWpm(1, new List<float> { 1, 2 }));
        AssertExtensions.IsApproximately(60, Stats.GetWpm(2, new List<float> { 1, 2 }));
        AssertExtensions.IsApproximately(60, Stats.GetWpm(4, new List<float> { 1, 2, 3, 4 }));
        AssertExtensions.IsApproximately(120, Stats.GetWpm(10, new List<float> { 1, 2, 3, 4, 5 }));
    }

    [TestMethod]
    public void Stats_RawWpmBySecond()
    {
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("", new List<float>()));

        // Incorrect length
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("an apple", new List<float>() { 1, 2, 3, 4 }));

        List<float> expectedValues = new() { 50, 60, 52.94f, 54.54f, 57.69f, 68.18f, 71.42f, 78.94f };
        List<float> actualValues = Stats.GetRawWpmBySecond("an apple", new List<float> { .3f, .5f, .85f, 1.1f, 1.3f, 1.32f, 1.47f, 1.52f });
        Assert.IsTrue(expectedValues.Count == actualValues.Count);
        for (int i = 0; i < expectedValues.Count; i++)
        {
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }
    }
}