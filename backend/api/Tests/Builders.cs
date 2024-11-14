using Schema;

namespace Tests;

public static class Builders
{
    public static Player BuildAnonPlayer(int i)
    {
        return new()
        {
            Id = "plyr_00" + i,
            CreatedS = 1,
            Type = PlayerAuthType.Anonymous,
            AnonAuthInfo = new AnonAuthInfo()
            {
                AuthToken = "auth_00" + i,
                LastLoginAt = 1
            }
        };
    }
}