using System.Configuration;
using System.Text.Json.Serialization;

public class TimeTrial
{
    [JsonPropertyName("id")]
    public string id { get; set; }

    [JsonPropertyName("name")]
    public string name { get; set; }

    [JsonPropertyName("phrase")]
    public string phrase { get; set; }

    public TimeTrial(string id, string name, string phrase)
    {
        this.id = id;
        this.name = name;
        this.phrase = phrase;
    }
}