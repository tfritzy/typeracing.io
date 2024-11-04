using System.Configuration;
using System.Text.Json.Serialization;

public class HostRegistration
{
    [JsonPropertyName("color")]
    public string color { get; set; }

    public HostRegistration(string color)
    {
        this.color = color;
    }
}