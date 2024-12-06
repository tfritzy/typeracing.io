using System.Reflection;
using System.Text;
using System.Text.Json;
using Schema;

namespace typeracing.io;

public static class Phrases
{
    public static string GetPhraseForGameMode(GameMode mode)
    {
        return mode switch
        {
            GameMode.MostCommon => RandomlyGrabFromList(new string[] { "the" }, 40, 60),
            GameMode.Common => GetPhraseFromWordFile("ThousandMostCommon.txt", 15, 25),
            GameMode.Dictionary => GetPhraseFromWordFile("words.txt", 15, 25),
            GameMode.LeastCommon => GetPhraseFromWordFile("RareWords.txt", 15, 25),
            GameMode.CopyPastas => GetPhraseFromWordFile("CopyPastas.txt", 1, 1),
            GameMode.SpamTap => GetClickRace(),
            GameMode.Numbers => GetPhraseForNumbers(),
            GameMode.HomeRow => GetPhraseFromWordFile("HomeRow.txt", 15, 25),
            GameMode.UpperRow => GetPhraseFromWordFile("UpperRow.txt", 15, 25),
            GameMode.LeftHand => GetPhraseFromWordFile("LeftHand.txt", 15, 25),
            GameMode.RightHand => GetPhraseFromWordFile("RightHand.txt", 15, 25),
            GameMode.AlternatingHand => GetPhraseFromWordFile("AlternatingHand.txt", 15, 25),
            GameMode.Marathon => GetPhraseFromWordFile("CommonWords.txt", 80, 115),
            GameMode.FakeWords => GetRandomLetterPhrase(20, 25),
            GameMode.LongestHundred => GetPhraseFromWordFile("LongestHundred.txt", 10, 15),
            Schema.GameMode.Invalid => throw new InvalidOperationException("Invalid game mode."),
            _ => throw new InvalidOperationException("Invalid game mode."),
        };
    }

    public static string RandomlyGrabFromList(string[] options, int minCount, int maxCount)
    {
        StringBuilder phrase = new();
        var numWords = Randy.Random.Next(minCount, maxCount);
        for (int i = 0; i < numWords; i++)
        {
            phrase.Append(options[Randy.Random.Next(options.Length)]);
            if (i != numWords - 1) phrase.Append(' ');
        }

        return phrase.ToString();
    }

    public static string GetClickRace()
    {
        string characters = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder phrase = new();
        int numCharacters = Randy.Random.Next(100, 200);
        char character = characters[Randy.Random.Next(characters.Length)];
        for (int i = 0; i < numCharacters; i++)
        {
            phrase.Append(character);

            if (i != numCharacters - 1) phrase.Append(' ');
        }

        return phrase.ToString();
    }

    public static string GetPhraseFromWordFile(string filename, int minWords, int maxWords)
    {
        string path = Path.Combine("data", "lists", filename);
        // string[] words = ReadLines(path);
        // return RandomlyGrabFromList(words, minWords, maxWords);

        int lineCount = File.ReadLines(path).Count();
        List<int> lineNumbersToInclude = new();
        int numWords = Randy.Random.Next(minWords, maxWords);
        while (lineNumbersToInclude.Count < numWords)
        {
            lineNumbersToInclude.Add(Randy.Random.Next(0, lineCount));
        }

        string[] words = new string[numWords];
        using (var sr = new StreamReader(path))
        {
            int lineNumber = 0;
            while (!sr.EndOfStream)
            {
                string? line = sr.ReadLine();
                if (line != null && lineNumbersToInclude.Contains(lineNumber))
                {
                    words[lineNumbersToInclude.IndexOf(lineNumber)] = line;
                }

                lineNumber++;
            }
        }

        StringBuilder phrase = new();
        for (int i = 0; i < numWords; i++)
        {
            if (String.IsNullOrEmpty(words[i]))
                continue;

            phrase.Append(words[i]);
            if (i != numWords - 1) phrase.Append(' ');
        }

        return phrase.ToString().Trim();
    }

    public static string GetRandomLetterPhrase(int minWords, int maxWords)
    {
        string characters = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder phrase = new();
        int numWords = Randy.Random.Next(minWords, maxWords);
        for (int i = 0; i < numWords; i++)
        {
            int wordLength = Randy.Random.Next(1, 10);
            for (int j = 0; j < wordLength; j++)
            {
                phrase.Append(characters[Randy.Random.Next(characters.Length)]);
            }

            if (i != numWords - 1) phrase.Append(' ');
        }

        return phrase.ToString();
    }

    public static string[] ReadLines(string path)
    {
        string? baseDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (baseDirectory == null)
        {
            throw new InvalidOperationException("Base directory could not be determined.");
        }

        string filePath = Path.Combine(baseDirectory, path);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"The file {filePath} was not found.");
        }

        string[] lines = File.ReadAllLines(filePath);
        return lines;
    }

    public static string GetPhraseForNumbers()
    {
        StringBuilder phrase = new();
        int numNumbers = Randy.Random.Next(20, 40);
        for (int i = 0; i < numNumbers; i++)
        {
            int numberLength = Randy.Random.Next(1, 10);
            for (int j = 0; j < numberLength; j++)
            {
                phrase.Append(Randy.Random.Next(0, 10));
            }

            if (i != numNumbers - 1) phrase.Append(" ");
        }

        return phrase.ToString();
    }

    public static string[] GetWords(string phrase)
    {
        return phrase.Split(" ");
    }
}