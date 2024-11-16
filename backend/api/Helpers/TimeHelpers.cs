public static class TimeHelpers
{
    public static double? OverrideTimeForTesting = null;
    public static double Now_s => OverrideTimeForTesting ?? (DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds;
}