namespace LightspeedTyping;

public class Player
{
    public string Name { get; set; }
    public Guid Id { get; set; } = Guid.NewGuid();

    public Player(string name, Guid id)
    {
        Name = name;
        Id = id;
    }
}