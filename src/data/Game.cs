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
    public float StartTime;
    public float RaceStartTime => StartTime + CountdownDuration;
    private Galaxy Galaxy { get; set; }

    public const float CountdownDuration = 5;
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
        Phrase = Phrases.GetRandomDictionaryPhrase();
        Words = Phrases.GetWords(Phrase);
    }

    public void Update()
    {
        if (State == GameState.Lobby)
        {
            AddBotsIfNeeded();
        }
        else if (State == GameState.Running || State == GameState.Countdown)
        {
            UpdatePlayerPositions();
            CheckStartGame();
            UpdateBotProgress();
        }
    }

    private void CheckStartGame()
    {
        if (State != GameState.Countdown)
        {
            return;
        }

        Console.WriteLine("Seconds till start: " + (StartTime + CountdownDuration - Galaxy.Time.Now));
        if (Galaxy.Time.Now - StartTime >= CountdownDuration)
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
            player.PositionKm += player.Velocity_km_s * Galaxy.Time.DeltaTime;
        }
    }

    private void AddBotsIfNeeded()
    {
        if (State != GameState.Lobby)
        {
            return;
        }

        if (Players.Count >= MaxPlayers)
        {
            return;
        }

        if (Galaxy.Time.Now - StartTime < Constants.TimeBeforeFillingBots)
        {
            return;
        }

        int botsToAdd = MaxPlayers - Players.Count;
        for (int i = 0; i < botsToAdd; i++)
        {
            InGamePlayer bot = new
            (
                name: "Bot " + i,
                id: IdGen.NewPlayerId(),
                token: IdGen.NewToken(),
                isBot: true
            );
            bot.BotConfig!.LastWordTime = Galaxy.Time.Now + CountdownDuration;
            Api.AddPlayerToGame(Galaxy, this, bot);
        }
    }

    private void UpdateBotProgress()
    {
        foreach (InGamePlayer player in Players)
        {
            if (player.BotConfig == null)
            {
                continue;
            }

            if (player.PositionKm > Words.Length)
            {
                continue;
            }

            string currentWord = Words[player.WordIndex];
            float timeToTypeWord_s = currentWord.Length / player.BotConfig.CharactersPerSecond;
            if (Galaxy.Time.Now - player.BotConfig.LastWordTime > timeToTypeWord_s)
            {
                player.BotConfig.LastWordTime = Galaxy.Time.Now;
                Api.TypeWord(
                    word: Words[player.WordIndex],
                    charCompletionTimes: new List<float>(),
                    playerId: player.Id,
                    Galaxy
                );
            }

        }
    }

    public static float CalculateVelocity_km_s(float percentComplete)
    {
        if (percentComplete > 1)
        {
            throw new ArgumentException("percentComplete must be between 0 and 1");
        }

        return 299_792f * percentComplete * percentComplete;
    }
}