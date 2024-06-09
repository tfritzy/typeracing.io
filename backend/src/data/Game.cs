using System.Security.Cryptography;
using Schema;

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
    public bool IsPractice { get; private set; }
    public float CountdownDuration => IsPractice ? 3 : DefaultCountdownDuration;

    public const float DefaultCountdownDuration = 10;
    public const int NetworkTickRate = 10;
    public const float NetworkTickDuration = 1 / NetworkTickRate;

    public enum GameState
    {
        Lobby,
        Countdown,
        Running,
        Complete
    }

    public Game(Galaxy galaxy, int maxPlayers = 4, GameMode mode = GameMode.Dictionary, bool isPractice = false)
    {
        Players = new List<InGamePlayer>();
        Placements = new List<string>();
        Id = IdGen.NewGameId();
        MaxPlayers = isPractice ? 1 : maxPlayers;
        Galaxy = galaxy;
        Phrase = Phrases.GetPhraseForGameMode(mode);
        CreationTime = Galaxy.Time.Now;
        Mode = mode;
        IsPractice = isPractice;
    }

    public void Update()
    {
        RemoveInactivePlayers();
        CheckGameEnd();

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

    public bool HasPlayerLeft(InGamePlayer player)
    {
        return
            player.IsDisconnected ||
            Galaxy.PlayerGameMap.ContainsKey(player.Id) && Galaxy.PlayerGameMap[player.Id] != Id ||
            !Galaxy.PlayerGameMap.ContainsKey(player.Id);
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

    private void CheckGameEnd()
    {
        bool allRealPlayersGone = Players.All(player =>
            player.BotConfig != null ||
            player.IsDisconnected ||
            Galaxy.PlayerGameMap.ContainsKey(player.Id) && Galaxy.PlayerGameMap[player.Id] != Id);
        if (allRealPlayersGone)
        {
            Logger.Log("All real players gone, closing game");
            Api.CloseGame(Galaxy, this);
        }

        if (Galaxy.Time.Now - CreationTime > Constants.MaxTimeBeforeForceClosingGame)
        {
            Logger.Log("Game has been open too long, closing game");
            Api.CloseGame(Galaxy, this);
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
            BotConfig botConfig = new();
            InGamePlayer bot = new
            (
                name: BotNames.GenerateName(botConfig.Wpm),
                id: IdGen.NewPlayerId(),
                token: IdGen.NewToken(),
                botConfig: botConfig
            );
            bot.BotConfig!.LastWordTime = Galaxy.Time.Now + CountdownDuration;
            Api.AddPlayerToGame(Galaxy, this, bot);
        }
    }

    private void RemoveInactivePlayers()
    {
        for (int i = 0; i < Players.Count; i++)
        {
            InGamePlayer player = Players[i];

            if (HasPlayerLeft(player))
            {
                continue;
            }

            if (player.BotConfig != null)
            {
                continue;
            }

            if (Galaxy.Time.Now - player.LastSeen > Constants.InactiveTimeBeforeKicking)
            {
                Logger.Log($"Kicking player {player.Name} for inactivity. Now: {Galaxy.Time.Now}, LastSeen: {player.LastSeen}");
                Api.DisconnectPlayer(player.Id, Galaxy, Id);
            }
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

            int nextIndex = Phrase.IndexOf(' ', player.PhraseIndex);
            nextIndex = nextIndex == -1 ? Phrase.Length : nextIndex + 1;
            string toType = Phrase.Substring(player.PhraseIndex, nextIndex - player.PhraseIndex);
            float timeToTypeWord_s = toType.Length / player.BotConfig.CharactersPerSecond;
            if (Galaxy.Time.Now - player.BotConfig.LastWordTime > timeToTypeWord_s)
            {
                List<KeyStroke> keyStrokes = new();
                for (int i = 0; i < toType.Length; i++)
                {
                    keyStrokes.Add(new KeyStroke
                    {
                        Character = toType[i].ToString(),
                        Time = Galaxy.Time.Now - RaceStartTime
                    });
                }

                player.BotConfig.LastWordTime = Galaxy.Time.Now;
                Api.TypeWord(
                    keyStrokes: keyStrokes,
                    playerId: player.Id,
                    token: player.Token,
                    Galaxy
                );
            }

        }
    }
}