public static class FunctionUrlHelper
{
    public static string GetFunctionBaseUrl()
    {
        // In local development, this will be something like http://localhost:7071
        // In Azure, it will be your function app URL
        var baseUrl = Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME") ?? "localhost:7071";

        // Determine if we're running locally
        var isLocal = string.IsNullOrEmpty(Environment.GetEnvironmentVariable("WEBSITE_INSTANCE_ID"));

        return isLocal ? $"http://{baseUrl}" : $"https://{baseUrl}";
    }

    public static string GetFunctionUrl(string functionName, string? code = null)
    {
        var baseUrl = GetFunctionBaseUrl();

        // If function key is provided, add it as a query parameter
        var functionKey = code ?? Environment.GetEnvironmentVariable($"{functionName}_KEY");
        var keyQueryParam = !string.IsNullOrEmpty(functionKey) ? $"?code={functionKey}" : "";

        return $"{baseUrl}/api/{functionName}{keyQueryParam}";
    }
}