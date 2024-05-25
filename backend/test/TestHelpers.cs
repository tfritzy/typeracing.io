namespace Tests;

public static class TH
{
    public static List<KeyStroke> Keystrokes(string str, int wpm = 60)
    {
        List<KeyStroke> keystrokes = new();
        float timePerChar = 60f / wpm / 5f;
        float time = timePerChar;
        foreach (char c in str)
        {
            keystrokes.Add(new KeyStroke { Character = c.ToString(), Time = time });
            time += timePerChar;
        }

        return keystrokes;
    }

    public static List<KeyStroke> KeystrokesForWord(string phrase, int wordIndex, int wpm = 60)
    {
        string[] words = phrase.Split(' ');
        string word = words[wordIndex];
        if (wordIndex != words.Length - 1)
        {
            word += " ";
        }
        return Keystrokes(word, wpm);
    }

    public static void TypeWholePhrase(Galaxy galaxy, Game game, InGamePlayer player, int wpm = 60)
    {
        var keystrokes = Keystrokes(game.Phrase, wpm);
        Api.TypeWord(keystrokes, player.Id, galaxy);
    }

    public static void TypeRemainderOfPhrase(Galaxy galaxy, Game game, InGamePlayer player, int wpm = 60)
    {
        var keystrokes = Keystrokes(game.Phrase.Substring(player.PhraseIndex), wpm);
        Api.TypeWord(keystrokes, player.Id, galaxy);
    }

    public static void AssertKeystrokesMatchStr(List<KeyStroke> strokes, string str)
    {
        Assert.AreEqual(str.Length, strokes.Count);
        for (int i = 0; i < str.Length; i++)
        {
            Assert.AreEqual(str[i].ToString(), strokes[i].Character);
        }
    }

    public static void AdvancePastCooldown(Galaxy galaxy, Game game)
    {
        galaxy.Time.Add(Game.CountdownDuration + .1f);
        galaxy.Update();
    }

    public static Game FindGameOfPlayer(Galaxy galaxy, InGamePlayer player)
    {
        return galaxy.ActiveGames[galaxy.PlayerGameMap[player.Id]];
    }

    public static List<OneofUpdate> GetUpdatesOfType(Galaxy galaxy, OneofUpdate.UpdateOneofCase type)
    {
        return galaxy.OutboxMessages().Where(m => m.UpdateCase == type).ToList();
    }

    public static void IsApproximately(float expected, float actual, float tolerance = 0.001f)
    {
        Assert.IsTrue(Math.Abs(expected - actual) < tolerance);
    }

    public static void AssertErrorCountsEqual(List<ErrorsAtTime> expected, List<ErrorsAtTime> actual)
    {
        Assert.AreEqual(expected.Count, actual.Count, $"Expected {expected.Count} value(s), but got {actual.Count}");

        for (int i = 0; i < expected.Count; i++)
        {
            Assert.AreEqual(
                expected[i].Time,
                actual[i].Time,
                $"Time at {i} not equal. Expected {expected[i].Time}, but got {actual[i].Time}");
            Assert.AreEqual(
                expected[i].ErrorCount,
                actual[i].ErrorCount,
                $"Error count at {i} not equal. Expected {expected[i].ErrorCount}, but got {actual[i].ErrorCount}");
        }
    }
}