using System.Buffers;
using System.IO.Pipelines;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Google.Protobuf;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Primitives;
using Microsoft.VisualStudio.TestTools.UnitTesting;
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
            var bodyReader = new Mock<PipeReader>();
            bodyReader
                .Setup(br => br.ReadAsync(It.IsAny<CancellationToken>()))
                .Returns(new ValueTask<ReadResult>(
                    new ReadResult(
                        new ReadOnlySequence<byte>(bodyBytes),
                        isCanceled: false,
                        isCompleted: true)));
            request.Setup(r => r.BodyReader).Returns(bodyReader.Object);
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

    public static Mock<Container> BuildFakeContainer<T>()
    {
        var container = new Mock<Container>();
        container
            .Setup(d => d.ReadItemAsync<T>(It.IsAny<string>(), It.IsAny<PartitionKey>(), null, default))
            .ThrowsAsync(new CosmosException(
                message: "Not found",
                statusCode: HttpStatusCode.NotFound,
                subStatusCode: 0,
                activityId: "mock-activity-id",
                requestCharge: 0));
        return container;
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
                player.id,
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
                trial.id,
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
                result.id,
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
                { "X-Player-Id", new StringValues(player.id) },
                { "X-Auth-Token", new StringValues(player.AnonAuthInfo.AuthToken) }
            },
            body: body,
            queryParams: null
        ).Object;

        return httpRequest;
    }

    public static List<KeyStroke> GetKeystrokesForPhrase(string phrase, float wpm)
    {
        float time = 0;
        float charTime = (1 / wpm) * 5;
        List<KeyStroke> keyStrokes = new List<KeyStroke>();
        foreach (char c in phrase)
        {
            keyStrokes.Add(new KeyStroke()
            {
                Character = c.ToString(),
                Time = time,
            });
            time += charTime;
        }

        return keyStrokes;
    }

    public static bool CompareTrialResult(TimeTrialResult expected, TimeTrialResult actual)
    {
        if (expected.ToString() != actual.ToString())
        {
            Console.WriteLine("- Expected - ");
            Console.WriteLine(expected.ToString());
            Console.WriteLine("-----------");
            Console.WriteLine("- Actual - ");
            Console.WriteLine(actual.ToString());
        }

        return expected.ToString() == actual.ToString();
    }

    public static bool CompareProto(IMessage expected, IMessage actual)
    {
        if (expected.ToString() != actual.ToString())
        {
            Console.WriteLine("- Expected - ");
            Console.WriteLine(expected.ToString());
            Console.WriteLine("-----------");
            Console.WriteLine("- Actual - ");
            Console.WriteLine(actual.ToString());
        }

        return expected.ToString() == actual.ToString();
    }
}