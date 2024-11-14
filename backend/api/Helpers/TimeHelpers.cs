public static class TimeHelpers
{
    public static double Now_s => (DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds;
}