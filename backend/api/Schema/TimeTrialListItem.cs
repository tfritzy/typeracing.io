using System.Configuration;
using System.Text.Json.Serialization;

public class TimeTrialListItem
{
    [JsonPropertyName("id")]
    public string id { get; set; }

    [JsonPropertyName("name")]
    public string name { get; set; }

    [JsonPropertyName("length")]
    public int length { get; set; }

    [JsonPropertyName("time")]
    public int? time { get; set; }

    [JsonPropertyName("place")]
    public int? place { get; set; }

    public TimeTrialListItem(TimeTrial timeTrial)
    {
        this.id = timeTrial.id;
        this.name = timeTrial.name;
        this.length = timeTrial.phrase.Split(" ").Length;
        this.time = null;
        this.place = null;
    }
}