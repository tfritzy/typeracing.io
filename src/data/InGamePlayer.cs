namespace LightspeedTyperacing;

public class InGamePlayer
{
    public string Name { get; set; }
    public string Id { get; set; }
    public string Token { get; set; }
    public int WordIndex { get; set; }
    public float Velocity_km_s { get; set; }
    public float PositionKm { get; set; }
    public List<float> CharCompletionTimes_s { get; set; }
    public BotConfig? BotConfig { get; set; }
    public bool IsDisconnected { get; set; }

    public InGamePlayer(string name, string id, string token, bool isBot = false)
    {
        Name = name;
        Id = id;
        Token = token;
        WordIndex = 0;
        Velocity_km_s = 0;
        PositionKm = 0;
        CharCompletionTimes_s = new List<float>();
        IsDisconnected = false;

        if (isBot)
        {
            BotConfig = new BotConfig();
        }
    }
}