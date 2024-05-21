namespace Tests;

public static class TH
{
    public static List<KeyStroke> Keystrokes(string str, int wpm = 60)
    {
        List<KeyStroke> keystrokes = new();
        float time = 0;
        float timePerChar = 60f / wpm;
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
        return Keystrokes(word, wpm);
    }

    public static void TypeWholePhrase(Galaxy galaxy, Game game, InGamePlayer player, int wpm = 60)
    {
        var keystrokes = Keystrokes(game.Phrase, wpm);
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
        float time = Game.CountdownDuration + .1f;
        galaxy.Time.Update(time);
        galaxy.Update();
    }

    public static Game FindGameOfPlayer(Galaxy galaxy, InGamePlayer player)
    {
        return galaxy.ActiveGames[galaxy.PlayerGameMap[player.Id]];
    }

    public static List<T> GetUpdatesOfType<T>(Galaxy galaxy)
    {
        return galaxy.OutboxMessages().Where(m => m is T) as List<T> ?? new List<T>();
    }
}