using System.Numerics;
using System.Text;

namespace LightspeedTyping;

public static class IdGen
{
    private const string Base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public static string CompactGuid(Guid guid)
    {
        var bytes = guid.ToByteArray();
        return Base62Encode(bytes);
    }

    private static string Base62Encode(byte[] bytes)
    {
        StringBuilder sb = new();
        BigInteger value = new BigInteger(bytes.Concat(new byte[] { 0 }).ToArray());
        while (value > 0)
        {
            int remainder = (int)(value % 62);
            sb.Insert(0, Base62Chars[remainder]);
            value /= 62;
        }
        return sb.ToString();
    }

    public static string GenerateId(string prefix)
    {
        return $"{prefix}_{CompactGuid(Guid.NewGuid())}";
    }

    public static string NewPlayerId() => GenerateId("plyr");
    public static string NewGameId() => GenerateId("game");
}