namespace LightspeedTyperacing;

public class BotConfig
{
    public int Wpm { get; private set; }
    public float LastWordTime { get; set; }

    public BotConfig()
    {
        Wpm = new Random().Next(50, 100);
    }
}