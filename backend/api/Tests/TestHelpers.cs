using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Google.Protobuf;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Primitives;
using Moq;
using Schema;

public static class TestHelpers
{
    public static Mock<HttpRequest> CreateMockRequest(
        Dictionary<string, StringValues>? headers = null,
        IMessage? body = null,
        Dictionary<string, string>? queryParams = null)
    {
        var request = new Mock<HttpRequest>();

        if (headers != null)
        {
            request.Setup(r => r.Headers).Returns(new HeaderDictionary(headers));
        }

        if (body != null)
        {
            byte[] bodyBytes = body.ToByteArray();
            var bodyStream = new MemoryStream();
            bodyStream.Write(bodyBytes, 0, bodyBytes.Length);
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

    public static CosmosClient BuildFakeClient(List<Mock<Container>> containers)
    {
        var mockDatabase = new Mock<Database>();
        var mockClient = new Mock<CosmosClient>();

        mockClient
            .Setup(c => c.GetDatabase(It.IsAny<string>()))
            .Returns(mockDatabase.Object);

        foreach (Mock<Container> container in containers)
        {
            mockDatabase
                .Setup(d => d.GetContainer(container.Name))
                .Returns(container.Object);
            mockClient
                .Setup(c => c.GetContainer(It.IsAny<string>(), container.Name))
                .Returns(container.Object);
        }

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

    public static void InsertTrial(Mock<Container> container, TimeTrial trial)
    {
        container
            .Setup(c => c.ReadItemAsync<TimeTrial>(
                trial.Id,
                It.IsAny<PartitionKey>(),
                null,
                default))
        .ReturnsAsync(Mock.Of<ItemResponse<TimeTrial>>(r =>
            r.Resource == trial &&
            r.StatusCode == HttpStatusCode.OK));
    }

    public static void InsertTrialResult(Mock<Container> container, TimeTrialResult result)
    {
        container
            .Setup(c => c.ReadItemAsync<TimeTrialResult>(
                result.Id,
                It.IsAny<PartitionKey>(),
                null,
                default))
        .ReturnsAsync(Mock.Of<ItemResponse<TimeTrialResult>>(r =>
            r.Resource == result &&
            r.StatusCode == HttpStatusCode.OK));
    }

    public static HttpRequest MakeAnonRequest(Player player, IMessage? body)
    {
        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Player-Id", new StringValues(player.Id) },
                { "X-Auth-Token", new StringValues(player.AnonAuthInfo.AuthToken) }
            },
            body: body,
            queryParams: null
        ).Object;

        return httpRequest;
    }
}