using LightspeedTyperacing;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Schema;

public class GameMetricsTracker
{
    private readonly TelemetryClient telemetryClient;
    private bool IsProd;

    private static GameMetricsTracker? _instance;
    public static GameMetricsTracker Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new GameMetricsTracker();
            }

            return _instance;
        }
    }

    public GameMetricsTracker()
    {
        string environment = Environment.GetEnvironmentVariable("ENVIRONMENT") ?? "Development";
        IsProd = environment == "Production";

        var config = TelemetryConfiguration.CreateDefault();
        config.ConnectionString = "InstrumentationKey=af45e685-f4dc-40da-a54a-e20d764499af;IngestionEndpoint=https://centralus-2.in.applicationinsights.azure.com/;LiveEndpoint=https://centralus.livediagnostics.monitor.azure.com/;ApplicationId=e3ec01e2-a954-4654-b405-45f93317a640";
        telemetryClient = new TelemetryClient(config);
    }

    public void TrackGamePlayed(string playerId, string eventName, int wpm, int place)
    {
        if (!IsProd)
        {
            return;
        }

        var properties = new Dictionary<string, string>
        {
            { "PlayerId", playerId },
        };
        var metrics = new Dictionary<string, double>
        {
            { "wpm", wpm },
            { "place", place },
            { "player", playerId.GetHashCode() },
        };

        telemetryClient.TrackEvent(eventName, properties, metrics);
        Logger.Log($"Tracked metric for {playerId} {wpm} {place}");
    }
}