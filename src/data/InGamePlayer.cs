namespace LightspeedTyperacing;

public class InGamePlayer
{
    public string Name { get; set; }
    public string Id { get; set; }
    public int WordIndex { get; set; }

    public InGamePlayer(string name, string id)
    {
        Name = name;
        Id = id;
        WordIndex = 0;
    }
}