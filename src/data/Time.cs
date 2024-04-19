namespace LightspeedTyperacing;

public static class Time
{
    public static float Now { get; set; }
    public static float DeltaTime { get; set; }

    public static void Update(float currentTime_s)
    {
        DeltaTime = currentTime_s - Now;
        Now = currentTime_s;
    }
}