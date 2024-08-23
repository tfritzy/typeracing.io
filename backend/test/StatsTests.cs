using System.Runtime.ExceptionServices;
using Schema;

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
        var strokes = TH.Keystrokes("hello", 120);
        CollectionAssert.AreEqual(
            new List<ErrorsAtTime>
            {
                new ErrorsAtTime { Time = 0f, ErrorCount = 0 },
            },
            Stats.GetErrorCountByTime(strokes, "hello"));

        int i;
        for (i = 1; i < 8; i++)
        {
            strokes.Insert(i, new KeyStroke { Character = "h", Time = .15f + .01f * i });
        }

        for (; i < 15; i++)
        {
            strokes.Insert(i, new KeyStroke { Character = "\b", Time = .15f + .01f * i });
        }

        TH.AssertErrorCountsEqual(
            new List<ErrorsAtTime>
            {
                new() { Time = 0f, ErrorCount = 0 },
                new() { Time = .16f, ErrorCount = 1 },
                new() { Time = .17f, ErrorCount = 2 },
                new() { Time = .18f, ErrorCount = 3 },
                new() { Time = .19f, ErrorCount = 4 },
                new() { Time = .20f, ErrorCount = 5 },
                new() { Time = .21f, ErrorCount = 6 },
                new() { Time = .22f, ErrorCount = 7 },
                new() { Time = .23f, ErrorCount = 6 },
                new() { Time = .24f, ErrorCount = 5 },
                new() { Time = .25f, ErrorCount = 4 },
                new() { Time = .26f, ErrorCount = 3 },
                new() { Time = .27f, ErrorCount = 2 },
                new() { Time = .28f, ErrorCount = 1 },
                new() { Time = .29f, ErrorCount = 0 },

            },
            Stats.GetErrorCountByTime(strokes, "hello"));
    }
}