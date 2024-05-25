namespace LightspeedTyperacing;

public class Time
{
    public float Now { get; set; }
    public float DeltaTime { get; set; }

    public void Add(float seconds)
    {
        Update(Now + seconds);
    }

    public void Update(float currentTime_s)
    {
        DeltaTime = currentTime_s - Now;
        Now = currentTime_s;
    }
}