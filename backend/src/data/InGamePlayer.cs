namespace LightspeedTyperacing;

public class InGamePlayer
{
    public string Name { get; set; }
    public string Id { get; set; }
    public string Token { get; set; }
    public int PhraseIndex { get; set; }
    public List<KeyStroke> KeyStrokes { get; set; }
    public BotConfig? BotConfig { get; set; }
    public bool IsDisconnected { get; set; }
    public int Errors { get; set; }
    public float LastSeen { get; set; }

    public InGamePlayer(string name, string id, string token, BotConfig? botConfig = null)
    {
        Name = name;
        Id = id;
        Token = token;
        PhraseIndex = 0;
        KeyStrokes = new List<KeyStroke>();
        IsDisconnected = false;
        BotConfig = botConfig;
    }
}