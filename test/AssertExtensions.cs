namespace Tests;

public static class AssertExtensions
{
    public static void IsApproximately(float expected, float actual, float tolerance = .01f)
    {
        if (Math.Abs(expected - actual) > tolerance)
        {
            throw new Exception($"Expected {expected} but got {actual}");
        }
    }

    public static bool ApproximatelyEqual(float expected, float actual, float tolerance = .01f)
    {
        return Math.Abs(expected - actual) <= tolerance;
    }
}