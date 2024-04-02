namespace LightspeedTyperacing;

public static class Time
{
    public static float Now { get; set; }
    public static float DeltaTime { get; set; }

    public static void Update(float deltaTime)
    {
        DeltaTime = deltaTime;
        Now += deltaTime;
    }
}