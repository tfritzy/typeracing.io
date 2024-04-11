namespace LightspeedTyperacing;

public class InGamePlayer
{
    public string Name { get; set; }
    public string Id { get; set; }
    public int WordIndex { get; set; }
    public float Velocity_km_s { get; set; }
    public float Position { get; set; }

    public InGamePlayer(string name, string id)
    {
        Name = name;
        Id = id;
        WordIndex = 0;
        Velocity_km_s = 0;
        Position = 0;
    }
}