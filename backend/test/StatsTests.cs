namespace Tests;

[TestClass]
public class StatsTests
{
    class TestSetup
    {
        public Galaxy Galaxy;
        public List<InGamePlayer> Players;

        public TestSetup()
        {
            Galaxy = new();
            Players = new();
            for (int i = 0; i < 4; i++)
            {
                InGamePlayer player = new(name: $"Player {i}", id: IdGen.NewPlayerId(), token: IdGen.NewToken());
                Players.Add(player);
                Api.FindGame(player.Name, player.Id, player.Token, Galaxy, false);
            }
        }
    }

    [TestMethod]
    public void Stats_ReturnsWpm()
    {
        var strokes = TH.Keystrokes("hello world", 120);

        TH.IsApproximately(120, Stats.GetWpm(strokes));

        strokes.Insert(0, new KeyStroke { Character = "h", Time = 0f });
        strokes.Insert(0, new KeyStroke { Character = "j", Time = 0f });
        strokes.Insert(2, new KeyStroke { Character = "\b", Time = 0f });
        strokes.Insert(2, new KeyStroke { Character = "\b", Time = 0f });

        TH.IsApproximately(120, Stats.GetWpm(strokes));

        strokes.Insert(0, new KeyStroke { Character = "h", Time = 0f });
        strokes.Insert(0, new KeyStroke { Character = "j", Time = 0f });

        TH.IsApproximately(141.81819f, Stats.GetWpm(strokes));
    }

    [TestMethod]
    public void Stats_ErrorCount()
    {
        var strokes = TH.Keystrokes("hello world", 120);
        CollectionAssert.AreEqual(
            new List<ErrorsAtTime>
            {
                new ErrorsAtTime { Time = 0f, ErrorCount = 0 },
            },
            Stats.GetErrorCountByTime(strokes, "hello world"));

        strokes.Insert(1, new KeyStroke { Character = "h", Time = .15f });
        strokes.Insert(2, new KeyStroke { Character = "j", Time = .2f });
        strokes.Insert(3, new KeyStroke { Character = "\b", Time = .25f });
        strokes.Insert(4, new KeyStroke { Character = "\b", Time = .3f });
        TH.AssertErrorCountsEqual(
            new List<ErrorsAtTime>
            {
                new() { Time = 0f, ErrorCount = 0 },
                new() { Time = .15f, ErrorCount = 1 },
                new() { Time = .2f, ErrorCount = 2 },
                new() { Time = .25f, ErrorCount = 1 },
                new() { Time = .3f, ErrorCount = 0 },
            },
            Stats.GetErrorCountByTime(strokes, "hello world"));

        Assert.Fail("Can't go beyond bounds");
    }
}