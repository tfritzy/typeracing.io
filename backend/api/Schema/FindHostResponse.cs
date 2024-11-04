using System.Configuration;
using System.Text.Json.Serialization;

public class FindHostResponse
{
    [JsonPropertyName("url")]
    public string url { get; set; }

    public FindHostResponse(string url)
    {
        this.url = url;
    }
}