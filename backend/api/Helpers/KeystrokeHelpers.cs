using Schema;

public static class KeystrokeHelpers
{
    public static string ParseKeystrokes(IEnumerable<KeyStroke> keyStrokes)
    {
        Stack<char> wordStack = new();
        foreach (KeyStroke keyStroke in keyStrokes)
        {
            if (keyStroke.Character == "\b")
            {
                if (wordStack.Count > 0)
                {
                    wordStack.Pop();
                }
            }
            else
            {
                wordStack.Push(keyStroke.Character[0]);
            }
        }

        string typedWord = new(wordStack.Reverse().ToArray());
        return typedWord;
    }

    public static float GetTime(IEnumerable<KeyStroke> keyStrokes)
    {
        return keyStrokes.Last().Time;
    }
}