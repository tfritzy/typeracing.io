using System.Security.Claims;

namespace Tests;

public static class ClaimsPrincipalFactory
{
    public static ClaimsPrincipal CreateAnonymous()
    {
        return new ClaimsPrincipal(new ClaimsIdentity());
    }

    public static ClaimsPrincipal CreateAuthenticated(
        string userId,
        string? email = null,
        string provider = "test-provider",
        Dictionary<string, string>? additionalClaims = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
        };

        if (email != null)
        {
            claims.Add(new Claim(ClaimTypes.Email, email));
        }

        if (provider != null)
        {
            claims.Add(new Claim("provider", provider));
        }

        if (additionalClaims != null)
        {
            claims.AddRange(additionalClaims.Select(c =>
                new Claim(c.Key, c.Value)));
        }

        return new ClaimsPrincipal(
            new ClaimsIdentity(claims, "TestAuth")
        );
    }
}