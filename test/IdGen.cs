using LightspeedTyping;

namespace Tests;

[TestClass]
public class IdGenTests
{
    [TestMethod]
    public void IdGen_HasCorrectPrefix()
    {
        Assert.IsTrue(IdGen.NewPlayerId().StartsWith("plyr"));
        Assert.IsTrue(IdGen.NewGameId().StartsWith("game"));
        Assert.IsTrue(IdGen.GenerateId("asdf").StartsWith("asdf"));
    }

    [TestMethod]
    public void IdGen_HasDifferentIds()
    {
        Assert.AreNotEqual(IdGen.NewPlayerId(), IdGen.NewPlayerId());
        Assert.AreNotEqual(IdGen.NewGameId(), IdGen.NewGameId());
        Assert.AreNotEqual(IdGen.GenerateId("asdf"), IdGen.GenerateId("asdf"));
    }

    [TestMethod]
    public void IsCorrectLength()
    {
        for (int i = 0; i < 100; i++)
        {
            Assert.IsTrue(IdGen.GenerateId("asdf").Length > 20);
        }
    }
}