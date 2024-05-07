using System.Reflection;
using System.Text;
using System.Text.Json;

namespace LightspeedTyperacing;

public static class Phrases
{
    public static string GetPhraseForGameMode(GameMode mode)
    {
        return mode switch
        {
            GameMode.Dictionary => GetRandomDictionaryPhrase(20, 40),
            GameMode.Numbers => GetPhraseForNumbers(),
            GameMode.Marathon => GetRandomDictionaryPhrase(60, 100),
            GameMode.HellDiver => GetHellDiverPhrase(),
        };
    }

    public static List<string> Parse(string path)
    {
        List<string> phrases = new();
        string fullText = File.ReadAllText(path);
        string[] paragraphs = fullText.Split("\n\n");
        for (int i = 0; i < paragraphs.Length; i++)
        {
            paragraphs[i] = paragraphs[i].Replace("\n", " ");
        }

        foreach (string paragraph in paragraphs)
        {
            string[] words = paragraph.Split(" ");
            if (words.Length < 20)
            {
                continue;
            }

            if (words.Length > 40)
            {
                continue;
            }

            phrases.Add(paragraph);
        }

        return phrases;
    }

    public static void WritePhrases(string path, List<string> phrases)
    {
        File.Create(path).Close();
        File.WriteAllText(path, JsonSerializer.Serialize(phrases));
    }

    public static string GetRandomDictionaryPhrase(int minWords, int maxWords)
    {
        string? baseDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (baseDirectory == null)
        {
            throw new InvalidOperationException("Base directory could not be determined.");
        }

        string wordsPath = Path.Combine(baseDirectory, "data", "dictionary", "words.txt");

        if (!File.Exists(wordsPath))
        {
            throw new FileNotFoundException($"The file {wordsPath} was not found.");
        }

        List<string> words = File.ReadAllLines(wordsPath).ToList();
        StringBuilder phrase = new();
        var numWords = Randy.Random.Next(minWords, maxWords);
        for (int i = 0; i < numWords; i++)
        {
            phrase.Append(words[Randy.Random.Next(words.Count)]);
            if (i != numWords - 1) phrase.Append(" ");
        }

        return phrase.ToString();
    }

    public static string GetRandomBookPhrase()
    {
        string? baseDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (baseDirectory == null)
        {
            throw new InvalidOperationException("Base directory could not be determined.");
        }

        string jsonFilePath = Path.Combine(baseDirectory, "data", "phrases", "phrases.json");

        if (!File.Exists(jsonFilePath))
        {
            throw new FileNotFoundException($"The file {jsonFilePath} was not found.");
        }

        string jsonContent = File.ReadAllText(jsonFilePath);
        List<string>? phrases = JsonSerializer.Deserialize<List<string>>(jsonContent) ?? new List<string>();

        if (phrases.Count == 0)
        {
            throw new InvalidOperationException("No phrases were loaded.");
        }

        var phrase = phrases[Randy.Random.Next(phrases.Count)];
        phrase = phrase.Replace("\n", " ");
        phrase = phrase.Replace("\r", " ");
        phrase = phrase.Replace("\t", " ");
        phrase = phrase.Replace("“", "\"");
        phrase = phrase.Replace("”", "\"");
        phrase = phrase.Replace("‘", "'");
        phrase = phrase.Replace("’", "'");
        phrase = phrase.Replace("—", "-");
        phrase = phrase.Replace("…", "...");
        return phrase;
    }

    public static string GetPhraseForNumbers()
    {
        Random random = new();
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

    public static string GetHellDiverPhrase()
    {
        string? baseDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        if (baseDirectory == null)
        {
            throw new InvalidOperationException("Base directory could not be determined.");
        }

        string path = Path.Combine(baseDirectory, "data", "helldivers", "codes.txt");

        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"The file {path} was not found.");
        }

        List<string> codes = File.ReadAllLines(path).ToList();

        StringBuilder phrase = new();
        var numCodes = Randy.Random.Next(5, 10);
        for (int i = 0; i < numCodes; i++)
        {
            phrase.Append(codes[Randy.Random.Next(codes.Count)]);
            if (i != numCodes - 1) phrase.Append(" ");
        }

        return phrase.ToString();
    }

    public static string[] GetWords(string phrase)
    {
        return phrase.Split(" ");
    }
}