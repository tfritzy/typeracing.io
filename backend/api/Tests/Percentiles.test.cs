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
        Assert.AreEqual(158, Percentiles.Calculate(data, .99f));
        Assert.AreEqual(98, Percentiles.Calculate(data, .90f));
        Assert.AreEqual(72, Percentiles.Calculate(data, .50f));
        Assert.AreEqual(50, Percentiles.Calculate(data, .25f));

        Assert.AreEqual(50, Percentiles.Calculate(data, .000001f));
        Assert.AreEqual(162, Percentiles.Calculate(data, .99999f));
    }
}