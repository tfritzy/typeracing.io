namespace LightspeedTyperacing;

public class BotConfig
{
    public float Wpm { get; private set; }
    public float LastWordTime { get; set; }
    public float CharactersPerSecond { get; private set; }

    public BotConfig()
    {
        Wpm = new Random().Next(50, 100);
        CharactersPerSecond = Wpm * 5 / 60;
    }
}