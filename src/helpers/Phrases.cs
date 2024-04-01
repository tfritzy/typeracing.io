using System.Reflection;
using System.Text.Json;

namespace LightspeedTyping;

public static class Phrases
{
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
            if (words.Length < 40)
            {
                continue;
            }

            if (words.Length > 100)
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

    public static string GetRandomPhrase()
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

        Random random = new();
        return phrases[random.Next(phrases.Count)];
    }

    public static string[] GetWords(string phrase)
    {
        return phrase.Split(" ");
    }
}