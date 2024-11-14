using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Schema;

public static class PlayerHelpers
{
    private const string databaseName = "aces";
    private const string containerName = "players";

    public static async Task<Player?> GetPlayer(CosmosClient cosmosClient, HttpRequest req, ClaimsPrincipal? claimsPrincipal)
    {
        Container container = cosmosClient.GetContainer(databaseName, containerName);
        Player? player = await ValidateAuthenticatedPlayer(container, claimsPrincipal);

        if (player == null)
        {
            var playerId = req.Headers["X-Player-Id"].FirstOrDefault();
            var authToken = req.Headers["X-Auth-Token"].FirstOrDefault();
            if (string.IsNullOrEmpty(playerId) || string.IsNullOrEmpty(authToken))
            {
                return null;
            }
            else
            {
                player = await ValidateAnonPlayer(container, playerId, authToken);
                return player;
            }
        }

        return null;
    }

    public static async Task<Player?> ValidateAnonPlayer(Container container, string playerId, string token)
    {
        ItemResponse<Player> response = await container.ReadItemAsync<Player>(
            playerId,
            new PartitionKey(playerId)
        );
        if (response != null)
        {
            Player player = response.Resource;

            if (player.Type != PlayerAuthType.Anonymous ||
                player.AnonAuthInfo?.AuthToken != token)
            {
                return null;
            }

            player.AnonAuthInfo.LastLoginAt = TimeHelpers.Now_s;
            await container.ReplaceItemAsync(player, playerId);

            return player;
        }
        else
        {
            var player = new Player
            {
                Id = playerId,
                Type = PlayerAuthType.Anonymous,
                CreatedS = TimeHelpers.Now_s,
                AnonAuthInfo = new AnonAuthInfo
                {
                    AuthToken = token,
                    LastLoginAt = TimeHelpers.Now_s
                }
            };

            var createResponse = await container.CreateItemAsync(player);
            return createResponse.Resource;
        }
    }

    public static async Task<Player?> ValidateAuthenticatedPlayer(Container container, ClaimsPrincipal? claimsPrincipal)
    {
        string? userId = claimsPrincipal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (claimsPrincipal == null || userId == null) return null;

        try
        {
            ItemResponse<Player> response = await container.ReadItemAsync<Player>(
                id: userId,
                partitionKey: new PartitionKey(userId)
            );
            Player player = response.Resource;

            if (player.AuthenticatedAuthInfo != null)
            {
                player.AuthenticatedAuthInfo.LastLoginAt = TimeHelpers.Now_s;
                await container.ReplaceItemAsync(player, userId);
            }

            return player;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            var player = new Player
            {
                Id = userId,
                Type = PlayerAuthType.Authenticated,
                CreatedS = TimeHelpers.Now_s,
                AuthenticatedAuthInfo = new AuthenticatedAuthInfo
                {
                    Provider = claimsPrincipal.FindFirst("provider")?.Value ?? "unknown",
                    ExternalId = userId,
                    Email = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value,
                    LastLoginAt = TimeHelpers.Now_s
                }
            };

            var response = await container.CreateItemAsync(player);
            return response.Resource;
        }
    }
}