namespace LightspeedTyping;

public class Game
{
    public List<Player> Players { get; set; }
    public Guid Id { get; set; }

    public Game()
    {
        Players = new List<Player>();
        Id = Guid.NewGuid();
    }
}