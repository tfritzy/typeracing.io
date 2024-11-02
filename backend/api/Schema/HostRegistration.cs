using System.Configuration;
using System.Text.Json.Serialization;

public class HostRegistration
{
    [JsonPropertyName("version")]
    public string Version { get; set; }

    public HostRegistration(string version)
    {
        Version = version;
    }
}