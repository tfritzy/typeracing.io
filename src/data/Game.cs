namespace LightspeedTyping;

public class Game
{
    public List<Player> Players { get; set; }
    public Guid Id { get; set; }
    public int MaxPlayers { get; set; }
    private Galaxy Galaxy { get; set; }
    private float StartTime;

    public const float CountdownDuration = 3;

    public Game(Galaxy galaxy, int maxPlayers = 4)
    {
        Players = new List<Player>();
        Id = Guid.NewGuid();
        MaxPlayers = maxPlayers;
        Galaxy = galaxy;
        StartTime = Time.Now;
    }

    public void Update()
    {
        if (Time.Now - StartTime > 3)
        {
            foreach (Player player in Players)
            {
                Galaxy.Outbox.Enqueue(new GameStarted(player.Id));
            }
        }
    }
}