using System.Configuration;
using System.Text.Json.Serialization;

public class Host
{
    [JsonPropertyName("id")]
    public string id { get; set; }

    [JsonPropertyName("ip")]
    public string ip { get; set; }

    [JsonPropertyName("hosts")]
    public string hosts { get; set; } = "hosts";

    public Host(string id, string ip)
    {
        this.id = id;
        this.ip = ip;
    }
}