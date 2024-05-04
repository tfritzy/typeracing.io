namespace Tests;

[TestClass]
public class StatsTests
{
    [TestMethod]
    public void Stats_Wpm()
    {
        AssertExtensions.IsApproximately(0, Stats.GetWpm(0, 1f, new List<float>()));
        AssertExtensions.IsApproximately(0, Stats.GetWpm(0, 1f, new List<float> { 1 }));
        AssertExtensions.IsApproximately(30, Stats.GetWpm(1, 1f, new List<float> { 1, 2 }));
        AssertExtensions.IsApproximately(60, Stats.GetWpm(2, 1f, new List<float> { 1, 2 }));
        AssertExtensions.IsApproximately(60, Stats.GetWpm(4, 1f, new List<float> { 1, 2, 3, 4 }));
        AssertExtensions.IsApproximately(120, Stats.GetWpm(10, 1f, new List<float> { 1, 2, 3, 4, 5 }));
    }

    [TestMethod]
    public void Stats_RawWpmBySecond()
    {
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("", new List<float>()));

        // Incorrect length
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("an apple", new List<float>() { 1, 2, 3, 4 }));

        // 50, 60, 52.94f, 54.54f, 57.69f, 68.18f, 71.42f, 78.94f
        List<float> expectedValues = new() { 54.31f, 66.15f };
        List<float> actualValues = Stats.GetRawWpmBySecond(
            "an apple",
            new List<float> { .3f, .5f, .85f, 1.1f, 1.3f, 1.32f, 1.47f, 1.52f });
        Assert.IsTrue(expectedValues.Count == actualValues.Count);
        for (int i = 0; i < expectedValues.Count; i++)
        {
            Assert.IsTrue(!float.IsNaN(actualValues[i]));
            Assert.IsTrue(!float.IsInfinity(actualValues[i]));
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }

        expectedValues = new() { 0f, 0f, 14.51f, 26.69f, 26.54f };
        actualValues = Stats.GetRawWpmBySecond(
            "an apple",
            new List<float> { 2.3f, 2.5f, 2.6f, 2.7f, 3.3f, 3.32f, 3.47f, 4.52f });
        Assert.IsTrue(expectedValues.Count == actualValues.Count);
        for (int i = 0; i < expectedValues.Count; i++)
        {
            Assert.IsTrue(!float.IsNaN(actualValues[i]));
            Assert.IsTrue(!float.IsInfinity(actualValues[i]));
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }
    }

    [TestMethod]
    public void Stats_RawWpmBySecond_AvoidsNaN()
    {
        var expectedValues = new List<float>() { 0f, 0f, 14.51f, 26.69f, 26.54f };
        var actualValues = Stats.GetRawWpmBySecond(
            "an apple",
            new List<float> { 2.3f, 2.5f, 2.6f, 2.7f, 3.3f, 3.32f, 3.47f, 4.52f });
        Assert.IsTrue(expectedValues.Count == actualValues.Count);
        for (int i = 0; i < expectedValues.Count; i++)
        {
            Assert.IsTrue(!float.IsNaN(actualValues[i]));
            Assert.IsTrue(!float.IsInfinity(actualValues[i]));
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }
    }

    [TestMethod]
    public void Stats_AggWpmBySecond_Example()
    {
        var expectedValues = new List<float>() { 0, 0, 0, 0, .11f, 11.64f, 16.09f, 15.95f };
        var actualValues = Stats.GetAggWpmBySecond(
            "an apple",
            new List<float> { 5.1f, 5.2f, 5.3f, 5.4f, 6.3f, 6.32f, 6.47f, 7.52f });
        for (int i = 0; i < expectedValues.Count; i++)
        {
            Assert.IsTrue(!float.IsNaN(actualValues[i]));
            Assert.IsTrue(!float.IsInfinity(actualValues[i]));
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }
    }

    [TestMethod]
    public void Stats_AggWpmBySecond()
    {
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("", new List<float>()));

        // Incorrect length
        CollectionAssert.AreEqual(new List<float>(), Stats.GetRawWpmBySecond("an apple", new List<float>() { 1, 2, 3, 4 }));

        List<float> expectedValues = new() { 53.90f, 64.92f, 52.65f, 40.38f, 28.11f, 21.73f };
        List<float> actualValues = Stats.GetAggWpmBySecond("an apple", new List<float> { .3f, .5f, .85f, 1.1f, 1.3f, 1.32f, 1.47f, 5.52f });
        Assert.AreEqual(expectedValues.Count, actualValues.Count);
        for (int i = 0; i < expectedValues.Count; i++)
        {
            AssertExtensions.IsApproximately(expectedValues[i], actualValues[i]);
        }
    }
}