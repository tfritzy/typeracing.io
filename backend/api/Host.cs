using System.Text.Json.Serialization;

public class Host
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("ip")]
    public string IP { get; set; }

    public Host(string id, string ip)
    {
        Id = id;
        IP = ip;
    }
}