namespace LightspeedTyping;

public class WordFinished : Message
{
    public string PlayerId { get; }
    public float PercentComplete { get; }

    public WordFinished(string recipientId, string playerId, float percentComplete) : base(recipientId)
    {
        PlayerId = playerId;
        PercentComplete = percentComplete;
    }
}