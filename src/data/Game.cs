namespace LightspeedTyperacing;

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
    public const int NetworkTickRate = 10;
    public const float NetworkTickDuration = 1 / NetworkTickRate;

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
        Phrase = Phrases.GetRandomDictionaryPhrase();
        Words = Phrases.GetWords(Phrase);
    }

    public void Update()
    {
        UpdatePlayerPositions();
        CheckStartGame();
    }

    private void CheckStartGame()
    {
        if (State != GameState.Countdown)
        {
            return;
        }

        if (Time.Now - StartTime > CountdownDuration)
        {
            State = GameState.Running;
            foreach (InGamePlayer player in Players)
            {
                Galaxy.Outbox.Enqueue(new OneofUpdate
                {
                    RecipientId = player.Id,
                    GameStarted = new GameStarted { },
                });
            }
        }
    }

    private void UpdatePlayerPositions()
    {
        foreach (InGamePlayer player in Players)
        {
            player.PositionKm += player.Velocity_km_s * Time.DeltaTime;
        }
    }

    public static float CalculateVelocity_km_s(float percentComplete)
    {
        if (percentComplete > 1)
        {
            throw new ArgumentException("percentComplete must be between 0 and 1");
        }

        return 299_792f * percentComplete;
    }
}