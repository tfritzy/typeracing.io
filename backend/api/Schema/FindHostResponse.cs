using System.Configuration;
using System.Text.Json.Serialization;

public class FindHostResponse
{
    [JsonPropertyName("ip")]
    public string ip { get; set; }

    public FindHostResponse(string ip)
    {
        this.ip = ip;
    }
}