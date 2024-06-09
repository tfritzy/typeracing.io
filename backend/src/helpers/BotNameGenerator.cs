namespace LightspeedTyperacing;

public static class BotNames
{
    public static string[][] Prefixes = new string[][] {
        new string[] {
            "Radiant",
            "Majestic",
            "Luminous",
            "Divine",
            "Ethereal",
            "Celestial",
            "Resplendent",
            "Dazzling",
        },
        new string[] {
            "Thick",
            "Fine",
            "Solid",
            "Exceptional",
            "Robust",
            "Sturdy",
            "Durable",
            "Excellent",
            "Premium",
        },
        new string[] {
            "Crude",
            "Low Quality",
            "Cracked",
            "Damaged",
            "Inferior",
        },
    };

    public static string[][] Suffixes = new string[][] {
        new string[] {
            "of Perfection",
            "of Nirvana",
            "of Brilliance",
            "of Enlightenment",
            "of Light",
            "of the Sun",
            "of the Ages",
        },
        new string[] {
            "of the Ox",
            "of Stability",
            "",
            "",
            "",
            "",
            "",
        },
        new string[] {
            "on the Fritz",
            "",
            "",
            "",
            "",
            "",
            "",
        },
    };

    private static int GetCategoryForWpm(float wpm)
    {
        if (wpm > 80)
        {
            return 0;
        }
        else if (wpm > 50)
        {
            return 1;
        }
        else
        {
            return 2;
        }
    }

    public static string GenerateName(float wpm)
    {
        Random random = new();
        int category = GetCategoryForWpm(wpm);
        string prefix = Prefixes[category][random.Next(Prefixes[category].Length)];
        string suffix = Suffixes[category][random.Next(Suffixes[category].Length)];
        return $"{prefix} Typewriter {suffix}";
    }
}