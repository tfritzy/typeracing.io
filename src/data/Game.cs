namespace LightspeedTyping;

public class Game
{
    public List<InGamePlayer> Players { get; set; }
    public List<string> Placements { get; set; }
    public string Id { get; set; }
    public int MaxPlayers { get; set; }
    public GameState State { get; set; }
    public string Phrase { get; private set; }
    public string[] Words { get; private set; }
    private Galaxy Galaxy { get; set; }
    private readonly float StartTime;

    public const float CountdownDuration = 3;

    public enum GameState
    {
        Lobby,
        Countdown,
        Running,
        Complete
    }

    public Game(Galaxy galaxy, int maxPlayers = 4)
    {
        Players = new List<InGamePlayer>();
        Placements = new List<string>();
        Id = IdGen.NewGameId();
        MaxPlayers = maxPlayers;
        Galaxy = galaxy;
        StartTime = Time.Now;
        Phrase = Phrases.GetRandomPhrase();
        Words = Phrases.GetWords(Phrase);
    }

    public void Update()
    {
        if (Time.Now - StartTime > CountdownDuration)
        {
            State = GameState.Running;
            foreach (InGamePlayer player in Players)
            {
                Galaxy.Outbox.Enqueue(new GameStarted(player.Id));
            }
        }
    }
}