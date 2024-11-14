using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Primitives;
using Moq;
using Schema;

public static class TestHelpers
{
    public static Mock<HttpRequest> CreateMockRequest(
        Dictionary<string, StringValues>? headers = null,
        object? body = null,
        Dictionary<string, string>? queryParams = null)
    {
        var request = new Mock<HttpRequest>();

        if (headers != null)
        {
            request.Setup(r => r.Headers).Returns(new HeaderDictionary(headers));
        }

        if (body != null)
        {
            var json = JsonSerializer.Serialize(body);
            var bodyStream = new MemoryStream();
            var writer = new StreamWriter(bodyStream);
            writer.Write(json);
            writer.Flush();
            bodyStream.Position = 0;
            request.Setup(r => r.Body).Returns(bodyStream);
        }

        // Set up query params
        if (queryParams != null)
        {
            var queryCollection = new Dictionary<string, StringValues>();
            foreach (var param in queryParams)
            {
                queryCollection.Add(param.Key, new StringValues(param.Value));
            }
            request.Setup(r => r.Query).Returns(new QueryCollection(queryCollection));
        }

        return request;
    }

    public static CosmosClient BuildFakeClient(Mock<Container> container)
    {
        var mockDatabase = new Mock<Database>();
        var mockClient = new Mock<CosmosClient>();

        Player? capturedPlayer = null;
        container
            .Setup(c => c.CreateItemAsync(
                It.IsAny<Player>(),
                null,
                null,
                default))
            .Callback<Player, PartitionKey?, ItemRequestOptions, CancellationToken>((player, pk, options, token) =>
            {
                capturedPlayer = player;
            })
            .ReturnsAsync(() => Mock.Of<ItemResponse<Player>>(r =>
                r.Resource == capturedPlayer &&
                r.StatusCode == HttpStatusCode.Created));

        mockClient
            .Setup(c => c.GetDatabase(It.IsAny<string>()))
            .Returns(mockDatabase.Object);
        mockDatabase
            .Setup(d => d.GetContainer(It.IsAny<string>()))
            .Returns(container.Object);
        mockClient
            .Setup(c => c.GetContainer(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(container.Object);

        return mockClient.Object;
    }

    public static void InsertPlayer(Mock<Container> container, Player player)
    {
        container
            .Setup(c => c.ReadItemAsync<Player>(
                player.Id,
                It.IsAny<PartitionKey>(),
                null,
                default))
        .ReturnsAsync(Mock.Of<ItemResponse<Player>>(r =>
            r.Resource == player &&
            r.StatusCode == HttpStatusCode.OK));
    }
}