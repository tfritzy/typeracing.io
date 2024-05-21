namespace LightspeedTyperacing;

public class Game
{
    public List<InGamePlayer> Players { get; set; }
    public List<string> Placements { get; set; }
    public string Id { get; set; }
    public int MaxPlayers { get; set; }
    public GameState State { get; set; }
    public string Phrase { get; private set; }
    public float CreationTime { get; private set; }
    public GameMode Mode { get; private set; }
    public float StartTime;
    public float RaceStartTime => StartTime + CountdownDuration;
    private Galaxy Galaxy { get; set; }

    public const float CountdownDuration = 10;
    public const int NetworkTickRate = 10;
    public const float NetworkTickDuration = 1 / NetworkTickRate;

    public enum GameState
    {
        Lobby,
        Countdown,
        Running,
        Complete
    }

    public Game(Galaxy galaxy, int maxPlayers = 4, GameMode mode = GameMode.Dictionary)
    {
        Players = new List<InGamePlayer>();
        Placements = new List<string>();
        Id = IdGen.NewGameId();
        MaxPlayers = maxPlayers;
        Galaxy = galaxy;
        Phrase = Phrases.GetPhraseForGameMode(mode);
        CreationTime = Galaxy.Time.Now;
        Mode = mode;
    }

    public void Update()
    {
        if (State == GameState.Lobby)
        {
            AddBotsIfNeeded();
        }
        else if (State == GameState.Running || State == GameState.Countdown)
        {
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

        if (Galaxy.Time.Now - StartTime >= CountdownDuration)
        {
            State = GameState.Running;
            foreach (InGamePlayer player in Players)
            {
                Galaxy.SendUpdate(player, Id, new OneofUpdate
                {
                    RecipientId = player.Id,
                    GameStarted = new GameStarted { },
                });
            }
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

        if (Galaxy.Time.Now - CreationTime < Constants.TimeBeforeFillingBots)
        {
            return;
        }

        int botsToAdd = MaxPlayers - Players.Count;
        for (int i = 0; i < botsToAdd; i++)
        {
            InGamePlayer bot = new
            (
                name: BotNames.GenerateName(),
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

            if (player.PhraseIndex >= Phrase.Length)
            {
                continue;
            }

            string currentWord = Phrase.Substring(player.PhraseIndex).Split(' ')[0];
            float timeToTypeWord_s = (currentWord.Length + 1) / player.BotConfig.CharactersPerSecond;
            if (Galaxy.Time.Now - player.BotConfig.LastWordTime > timeToTypeWord_s)
            {
                List<KeyStroke> keyStrokes = new();
                for (int i = 0; i < currentWord.Length; i++)
                {
                    keyStrokes.Add(new KeyStroke
                    {
                        Character = currentWord[i].ToString(),
                        Time = Galaxy.Time.Now - RaceStartTime
                    });
                }

                player.BotConfig.LastWordTime = Galaxy.Time.Now;
                Api.TypeWord(
                    keyStrokes: keyStrokes,
                    playerId: player.Id,
                    Galaxy
                );
            }

        }
    }
}