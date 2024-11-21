using Schema;
using typeracing.io;

namespace Tests;

public static class TH
{
    public static List<KeyStroke> GetKeystrokes(string str, int wpm = 60)
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
        return GetKeystrokes(word, wpm);
    }

    public static void TypeWholePhrase(Galaxy galaxy, Game game, typeracing.io.InGamePlayer player, int wpm = 60)
    {
        var keystrokes = GetKeystrokes(game.Phrase, wpm);
        Api.TypeWord(keystrokes, player, galaxy);
    }

    public static void TypeRemainderOfPhrase(Galaxy galaxy, Game game, typeracing.io.InGamePlayer player, int wpm = 60)
    {
        var keystrokes = GetKeystrokes(game.Phrase.Substring(player.PhraseIndex), wpm);
        Api.TypeWord(keystrokes, player, galaxy);
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
        galaxy.Time.Add(game.CountdownDuration + .1f);
        galaxy.Update();
    }

    public static Game FindGameOfPlayer(Galaxy galaxy, typeracing.io.InGamePlayer player)
    {
        string gameId = galaxy.PlayerGameMap[player.Id];

        if (galaxy.ActiveGames.ContainsKey(gameId))
        {
            return galaxy.ActiveGames[gameId];
        }

        return galaxy.OpenGames.First(g => g.Id == gameId);
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
            IsApproximately(
                expected[i].Time,
                actual[i].Time);
            IsApproximately(
                expected[i].ErrorCount,
                actual[i].ErrorCount);
        }
    }
}