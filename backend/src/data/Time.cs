namespace LightspeedTyperacing;

public class Time
{
    public float Now { get; set; }
    public float DeltaTime { get; set; }

    public void Add(float seconds)
    {
        Update(seconds);
    }

    public void Update(float deltaTime_s)
    {
        DeltaTime = deltaTime_s;
        Now += deltaTime_s;
    }
}