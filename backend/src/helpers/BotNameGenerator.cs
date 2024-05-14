namespace LightspeedTyperacing;

public static class BotNames
{
    public static string[] Suffixes = new string[] {
        "Android",
        "Computer",
        "AI",
        "Machine",
        "Cyborg",
        "Automaton",
        "Bot",
        "Mech",
    };

    public static string[] Prefixes = new string[] {
        "Electric",
        "Cyber",
        "Turbo",
        "Quantum",
        "Hyper",
        "Titanium",
        "Iron",
        "Galactic",
        "Omni",
        "Solar",
        "Apex",
        "Alpha",
        "Beta",
        "Radiant",
        "Chrono",
    };

    public static string GenerateName()
    {
        Random random = new();
        string prefix = Prefixes[random.Next(Prefixes.Length)];
        string suffix = Suffixes[random.Next(Suffixes.Length)];
        return prefix + " " + suffix;
    }
}