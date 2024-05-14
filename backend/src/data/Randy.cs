namespace LightspeedTyperacing;

public static class Randy {
    public static System.Random Random = new();

    public static void SetSeed(int seed) {
        Random = new System.Random(seed);
    }
}