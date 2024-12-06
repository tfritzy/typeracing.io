namespace Schema;

public static class Stats
{
    /// <summary>
    /// Returns the WPM at each second, based on the percent of the phrase 
    /// that was completed within that second.
    /// </summary>
    public static List<float> GetRawWpmBySecond(List<KeyStroke> keystrokes)
    {
        if (keystrokes.Count == 0)
        {
            return new List<float>();
        }

        List<float> wpmBySecond = new();
        List<int> charCountBySecond = new();
        for (int i = 0; i < keystrokes.Count; i++)
        {
            int second = (int)Math.Floor(keystrokes[i].Time);

            if (second < 0)
            {
                throw new InvalidOperationException("Can't be sending neagtive keystrokes. Got: " + second);
            }

            while (charCountBySecond.Count <= second)
                charCountBySecond.Add(0);
            while (wpmBySecond.Count <= second)
                wpmBySecond.Add(0);

            charCountBySecond[second]++;
        }

        for (int i = 0; i < wpmBySecond.Count; i++)
        {
            if (charCountBySecond[i] == 0)
            {
                wpmBySecond[i] = 0;
                continue;
            }

            wpmBySecond[i] = GetWpm(charCountBySecond[i], 1);
        }

        for (int i = 2; i < wpmBySecond.Count; i++)
        {
            wpmBySecond[i] = (wpmBySecond[i - 2] + wpmBySecond[i - 1] + wpmBySecond[i]) / 3;
        }

        return wpmBySecond;
    }

    /// <summary>
    /// Returns the running WPM at each second, based on what percent of the
    /// phrase they had completed by that point.
    /// </summary>
    public static List<float> GetAggWpmBySecond(List<KeyStroke> keyStrokes)
    {
        if (keyStrokes.Count == 0)
        {
            return new List<float>();
        }

        List<float> progressionStack = new();
        for (int i = 0; i < keyStrokes.Count; i++)
        {
            if (keyStrokes[i].Character == "\b")
            {
                progressionStack.RemoveAt(progressionStack.Count - 1);
            }
            else
            {
                progressionStack.Add(keyStrokes[i].Time);
            }
        }

        List<float> aggWpmByCharacter = new();
        for (int i = 0; i < progressionStack.Count; i++)
        {
            aggWpmByCharacter.Add(GetWpm(i + 1, progressionStack[i]));
        }

        int target = 1;
        List<int> nearestIndexPriorWpmToSecondBounds = new();
        for (int i = 0; i < aggWpmByCharacter.Count; i++)
        {
            while (progressionStack[i] > target)
            {
                target += 1;
                nearestIndexPriorWpmToSecondBounds.Add(Math.Max(i - 1, 0));
            }
        }

        List<float> wpmBySecond = new();
        for (int i = 0; i < nearestIndexPriorWpmToSecondBounds.Count; i++)
        {
            int second = i + 1;
            int priorI = nearestIndexPriorWpmToSecondBounds[i];
            float prevVal = aggWpmByCharacter[priorI];
            float nextVal = aggWpmByCharacter[priorI + 1];
            float priorTime = progressionStack[priorI];
            float nextTime = progressionStack[priorI + 1];
            float timespan = nextTime - priorTime;
            float percentAlongTimespan = (second - priorTime) / timespan;
            float lerpedWpm = prevVal + (nextVal - prevVal) * percentAlongTimespan;
            lerpedWpm = Math.Max(lerpedWpm, 0);
            wpmBySecond.Add(lerpedWpm);
        }

        float finalWpm = aggWpmByCharacter[^1];
        wpmBySecond.Add(finalWpm);

        return wpmBySecond;
    }

    public static List<ErrorsAtTime> GetErrorCountByTime(List<KeyStroke> keyStrokes, string phrase)
    {
        if (keyStrokes.Count == 0)
        {
            return new List<ErrorsAtTime>();
        }

        List<ErrorsAtTime> errorCountByTime = new() { new ErrorsAtTime { Time = 0, ErrorCount = 0 } };
        Stack<char> typedStack = new();
        int errorCount = 0;

        foreach (KeyStroke stroke in keyStrokes)
        {
            if (stroke.Character == "\b")
            {
                if (typedStack.Count > 0)
                {
                    if (typedStack.Count > phrase.Length || typedStack.Peek() != phrase[typedStack.Count - 1])
                    {
                        errorCount--;
                        errorCountByTime.Add(new ErrorsAtTime
                        {
                            Time = stroke.Time,
                            ErrorCount = errorCount
                        });
                    }

                    typedStack.Pop();
                }
            }
            else
            {
                typedStack.Push(stroke.Character[0]);

                if (typedStack.Count > phrase.Length || typedStack.Peek() != phrase[typedStack.Count - 1])
                {
                    errorCount++;
                    errorCountByTime.Add(new ErrorsAtTime
                    {
                        Time = stroke.Time,
                        ErrorCount = errorCount
                    });
                }
            }
        }

        return errorCountByTime;
    }

    public static float CalculateAccuracy(IList<KeyStroke> strokes, string phrase)
    {
        int errors = GetErrorCount(strokes, phrase);
        return 1 - errors / (float)phrase.Length;
    }

    public static int GetErrorCount(IList<KeyStroke> keyStrokes, string phrase)
    {
        Stack<char> typedStack = new();
        int errorCount = 0;

        foreach (KeyStroke stroke in keyStrokes)
        {
            if (stroke.Character == "\b")
            {
                if (typedStack.Count > 0)
                {
                    typedStack.Pop();
                }
            }
            else
            {
                typedStack.Push(stroke.Character[0]);

                if (typedStack.Count > phrase.Length || typedStack.Peek() != phrase[typedStack.Count - 1])
                {
                    errorCount++;
                }
            }
        }

        return errorCount;
    }

    public static float GetWpm(IList<KeyStroke> keyStrokes)
    {
        if (keyStrokes.Count == 0)
        {
            return 0;
        }

        string parsed = ParseKeystrokes(keyStrokes);
        return GetWpm(parsed.Length, keyStrokes[^1].Time);
    }

    public static float GetWpm(int charCount, float time_s)
    {
        return charCount / time_s * 60 / 5;
    }

    public static float GetTime(IEnumerable<KeyStroke> keystrokes)
    {
        return keystrokes.Last().Time;
    }

    public static float WpmToTime(float wpm, int charCount)
    {
        return (charCount * 60) / (5 * wpm);
    }

    public static string ParseKeystrokes(IList<KeyStroke> keyStrokes)
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

}