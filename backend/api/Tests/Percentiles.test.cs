using Microsoft.VisualStudio.TestTools.UnitTesting;

[TestClass]
public class PercentilesTest
{
    [TestMethod]
    public void Percentile_CalculatesCorrectValues()
    {
        Dictionary<int, int> data = new();
        data[50] = 752;
        data[72] = 431;
        data[81] = 345;
        data[90] = 243;
        data[94] = 214;
        data[98] = 184;
        data[145] = 82;
        data[158] = 15;
        data[162] = 9;

        // totalCount = 2,251
        // p99 = top 22 results. Within the 158 bucket
        // p90 = top 225 results. Within the 98 bucket
        // p50 = top 1125 results. Within the 72 bucket
        // p25 = top 1688 results. Within the 50 bucket
        Assert.AreEqual(158, Percentiles.CalculateValueFromPercentile(data, .99f));
        Assert.AreEqual(98, Percentiles.CalculateValueFromPercentile(data, .90f));
        Assert.AreEqual(72, Percentiles.CalculateValueFromPercentile(data, .50f));
        Assert.AreEqual(50, Percentiles.CalculateValueFromPercentile(data, .25f));

        Assert.AreEqual(50, Percentiles.CalculateValueFromPercentile(data, .000001f));
        Assert.AreEqual(162, Percentiles.CalculateValueFromPercentile(data, .99999f));
    }

    [TestMethod]
    public void Percentile_WeirdResults()
    {
        Dictionary<int, int> data = new();
        data[83] = 1;
        data[88] = 1;

        Assert.AreEqual(88, Percentiles.CalculateValueFromPercentile(data, .99f));
        Assert.AreEqual(83, Percentiles.CalculateValueFromPercentile(data, .50f));

        Assert.AreEqual(83, Percentiles.CalculateValueFromPercentile(data, .000001f));
        Assert.AreEqual(88, Percentiles.CalculateValueFromPercentile(data, .99999f));
    }

    [TestMethod]
    public void Percentile_WeirdResults1()
    {
        Dictionary<int, int> data = new();
        data[91] = 1;

        Assert.AreEqual(0, Percentiles.CalculatePercentile(data, 88));
        Assert.AreEqual(1, Percentiles.CalculatePercentile(data, 100));
    }

    [TestMethod]
    public void Percentile_CalculatesCorrectPercentiles()
    {
        Dictionary<int, int> data = new();
        data[50] = 752;
        data[72] = 431;
        data[81] = 345;
        data[90] = 243;
        data[94] = 214;
        data[98] = 184;
        data[145] = 82;
        data[158] = 15;
        data[162] = 9;

        // totalCount = 2,251
        // p99 = top 22 results. Within the 158 bucket
        // p90 = top 225 results. Within the 98 bucket
        // p50 = top 1125 results. Within the 72 bucket
        // p25 = top 1688 results. Within the 50 bucket
        IsApproximately(.996044f, Percentiles.CalculatePercentile(data, 158));
        IsApproximately(.9534f, Percentiles.CalculatePercentile(data, 98));
        IsApproximately(.52f, Percentiles.CalculatePercentile(data, 72));
        IsApproximately(.33054f, Percentiles.CalculatePercentile(data, 50));

        IsApproximately(0, Percentiles.CalculatePercentile(data, 5));
        IsApproximately(1, Percentiles.CalculatePercentile(data, 300));
    }

    public static void IsApproximately(float expected, float actual, float tolerance = 0.001f)
    {
        Assert.IsTrue(Math.Abs(expected - actual) < tolerance, $"{expected} not within {tolerance} of {actual}");
    }

}