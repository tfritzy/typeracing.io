using System.Net;
using api;
using Google.Protobuf;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Primitives;
using Microsoft.VisualStudio.TestPlatform.ObjectModel.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Schema;

namespace Tests;

[TestClass]
public class ReportTimeTrialResultTests
{
    private class TestSetup
    {
        public Player Player;
        public CosmosClient Client;
        public TimeTrial Trial;
        public Mock<Container> TrialContainer;
        public Mock<Container> TrialResultsContainer;
        public Mock<Container> PlayersContainer;

        public TestSetup(
            Player player,
            TimeTrial timeTrial,
            CosmosClient client,
            Mock<Container> trialResultsContainer,
            Mock<Container> trialContainer,
            Mock<Container> playersContainer)
        {
            Player = player;
            Trial = timeTrial;
            Client = client;
            TrialResultsContainer = trialResultsContainer;
            TrialContainer = trialContainer;
            PlayersContainer = playersContainer;
        }
    }

    private TestSetup SetupWorld()
    {
        TimeHelpers.OverrideTimeForTesting = 18.5;
        var playerContainer = TestHelpers.BuildFakeContainer<Player>();
        playerContainer.Name = DB.Players;
        Player player = Builders.BuildAnonPlayer(1);
        TestHelpers.InsertPlayer(playerContainer, player);
        Player? capturedPlayer = null;
        playerContainer
          .Setup(c => c.CreateItemAsync(
              It.IsAny<Player>(),
              It.IsAny<PartitionKey>(),
              null,
              default))
          .Callback<Player, PartitionKey?, ItemRequestOptions, CancellationToken>((player, pk, options, token) =>
          {
              capturedPlayer = player;
          })
          .ReturnsAsync(() => Mock.Of<ItemResponse<Player>>(r =>
              r.Resource == capturedPlayer &&
              r.StatusCode == HttpStatusCode.Created));

        var trialContainer = TestHelpers.BuildFakeContainer<TimeTrial>();
        trialContainer.Name = DB.TimeTrials;
        TimeTrial timeTrial = Builders.BuildTimeTrial(1);
        TestHelpers.InsertTrial(trialContainer, timeTrial);

        var trialResultsContainer = TestHelpers.BuildFakeContainer<TimeTrialResult>();
        trialResultsContainer.Name = DB.TimeTrialResults;

        var client = TestHelpers.BuildFakeClient([playerContainer, trialContainer, trialResultsContainer]);
        var function = new ReportTimeTrialResult(client);
        var claimsPrincipal = ClaimsPrincipalFactory.CreateAnonymous();

        return new TestSetup(
            player: player,
            timeTrial: timeTrial,
            client: client,
            trialResultsContainer: trialResultsContainer,
            trialContainer: trialContainer,
            playersContainer: playerContainer);
    }

    [TestMethod]
    public void Unauthorized_WithoutPlayerId()
    {
        TestSetup setup = SetupWorld();

        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Auth-Token", new StringValues("abc") }
            },
            body: null,
            queryParams: null
        ).Object;

        var function = new ReportTimeTrialResult(setup.Client);
        IActionResult result = function.Run(httpRequest, null).Result;
        Assert.IsTrue(result is UnauthorizedResult);
    }

    [TestMethod]
    public void Unauthorized_WithoutAuthToken()
    {
        TestSetup setup = SetupWorld();

        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Player-Id", new StringValues("abc") }
            },
            body: null,
            queryParams: null
        ).Object;

        var function = new ReportTimeTrialResult(setup.Client);
        IActionResult result = function.Run(httpRequest, null).Result;
        Assert.IsTrue(result is UnauthorizedResult);
    }

    [TestMethod]
    public void BadRequest_MissingBody()
    {
        TestSetup setup = SetupWorld();

        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, null);
        var function = new ReportTimeTrialResult(setup.Client);
        IActionResult response = function.Run(httpRequest, null).Result;

        Assert.AreEqual(typeof(BadRequestObjectResult), response.GetType());
        Assert.AreEqual("Invalid request body", (response as ObjectResult)!.Value);
    }

    [TestMethod]
    public void BadRequest_MissingTrialId()
    {
        TestSetup setup = SetupWorld();
        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest();
        reqBody.Keystrokes.Add(new KeyStroke() { Character = "a", Time = 1 });
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IActionResult response = function.Run(httpRequest, null).Result;

        Assert.AreEqual(typeof(BadRequestObjectResult), response.GetType());
        Assert.AreEqual("Missing trial id", (response as ObjectResult)!.Value);
    }

    [TestMethod]
    public void BadRequest_MissingKeystrokes()
    {
        TestSetup setup = SetupWorld();
        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = "trial_001" };
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IActionResult response = function.Run(httpRequest, null).Result;

        Assert.AreEqual(typeof(BadRequestObjectResult), response.GetType());
        Assert.AreEqual("Missing keystrokes", (response as ObjectResult)!.Value);
    }

    [TestMethod]
    public void BadRequest_NonExistantTrial()
    {
        TestSetup setup = SetupWorld();

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = "trial_nonexistant" };
        reqBody.Keystrokes.Add(new KeyStroke());
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);
        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        Assert.AreEqual(404, response.StatusCode);
        Assert.AreEqual("Trial not found", (response as ObjectResult)!.Value);
    }

    [TestMethod]
    public void BadRequest_IncorrectPhrase()
    {
        TestSetup setup = SetupWorld();

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(new KeyStroke() { Character = "a" });
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);
        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        setup.TrialResultsContainer.Verify(x => x.ReplaceItemAsync(
            It.IsAny<TimeTrialResult>(),
            It.IsAny<string>(),
            It.IsAny<PartitionKey>(),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Never);

        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkRequest_UpdatesExistingResult_Best()
    {
        TestSetup setup = SetupWorld();
        TimeTrialResult result = Builders.BuildTimeTrialResult(setup.Trial, setup.Player.id);
        var ogKeystrokes = new List<KeyStroke>(result.BestKeystrokes.Select(ks => ks.Clone()));
        TestHelpers.InsertTrialResult(setup.TrialResultsContainer, result);

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 120));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        var expectedItem = new TimeTrialResult()
        {
            id = setup.Trial.id,
            PlayerId = setup.Player.id,
            BestTime = KeystrokeHelpers.GetTime(reqBody.Keystrokes),
        };
        expectedItem.BestKeystrokes.Add(reqBody.Keystrokes);
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(ogKeystrokes));
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(reqBody.Keystrokes));
        setup.TrialResultsContainer.Verify(x => x.ReplaceItemAsync(
            It.Is<TimeTrialResult>(tr => TestHelpers.CompareTrialResult(expectedItem, tr)),
            setup.Trial.id,
            new PartitionKey(setup.Player.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkRequest_AddsTimeToGlobalScore()
    {
        TestSetup setup = SetupWorld();
        TimeTrialResult result = Builders.BuildTimeTrialResult(setup.Trial, setup.Player.id);
        var ogKeystrokes = new List<KeyStroke>(result.BestKeystrokes.Select(ks => ks.Clone()));
        TestHelpers.InsertTrialResult(setup.TrialResultsContainer, result);

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 120));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        var expectedItem = new TimeTrial()
        {
            id = setup.Trial.id,
            Phrase = setup.Trial.Phrase,
            Name = setup.Trial.Name,
        };
        expectedItem.GlobalTimes.Add((uint)KeystrokeHelpers.GetTime(ogKeystrokes), 1);
        setup.TrialContainer.Verify(x => x.ReplaceItemAsync(
            It.Is<TimeTrial>(tr => TestHelpers.CompareProto(expectedItem, tr)),
            setup.Trial.id,
            new PartitionKey(setup.Trial.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkRequest_UpdatesExistingResult_NotBest()
    {
        TestSetup setup = SetupWorld();
        TimeTrialResult result = Builders.BuildTimeTrialResult(setup.Trial, setup.Player.id);
        TestHelpers.InsertTrialResult(setup.TrialResultsContainer, result);

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 20));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        var expectedItem = new TimeTrialResult()
        {
            id = setup.Trial.id,
            PlayerId = setup.Player.id,
            BestTime = result.BestTime,
        };
        expectedItem.BestKeystrokes.Add(result.BestKeystrokes);
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(result.BestKeystrokes));
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(reqBody.Keystrokes));
        setup.TrialResultsContainer.Verify(x => x.ReplaceItemAsync(
            It.Is<TimeTrialResult>(tr => TestHelpers.CompareTrialResult(expectedItem, tr)),
            setup.Trial.id,
            new PartitionKey(setup.Player.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkRequest_CreatesNewResult()
    {
        TestSetup setup = SetupWorld();
        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 60));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        var expectedItem = new TimeTrialResult()
        {
            id = setup.Trial.id,
            PlayerId = setup.Player.id,
            BestTime = KeystrokeHelpers.GetTime(reqBody.Keystrokes),
        };
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(reqBody.Keystrokes));
        expectedItem.BestKeystrokes.Add(reqBody.Keystrokes);
        setup.TrialResultsContainer.Verify(x => x.CreateItemAsync(
            It.Is<TimeTrialResult>(tr => TestHelpers.CompareTrialResult(expectedItem, tr)),
            new PartitionKey(setup.Player.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkResult_CreatesNewAnonPlayer()
    {
        TestSetup setup = SetupWorld();
        Player newPlayer = Builders.BuildAnonPlayer(2);
        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { id = setup.Trial.id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 60));
        var httpRequest = TestHelpers.MakeAnonRequest(newPlayer, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;
        Assert.AreEqual(200, response.StatusCode);

        var expectedItem = new TimeTrialResult()
        {
            id = setup.Trial.id,
            PlayerId = newPlayer.id,
            BestTime = KeystrokeHelpers.GetTime(reqBody.Keystrokes),
        };
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(reqBody.Keystrokes));
        expectedItem.BestKeystrokes.Add(reqBody.Keystrokes);
        setup.TrialResultsContainer.Verify(x => x.CreateItemAsync(
            It.Is<TimeTrialResult>(tr => TestHelpers.CompareTrialResult(expectedItem, tr)),
            new PartitionKey(newPlayer.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());

        var expectedPlayer = new Player()
        {
            id = newPlayer.id,
            Type = PlayerAuthType.Anonymous,
            CreatedS = TimeHelpers.Now_s,
            AnonAuthInfo = new AnonAuthInfo()
            {
                AuthToken = newPlayer.AnonAuthInfo.AuthToken,
                LastLoginAt = TimeHelpers.Now_s
            }
        };

        setup.PlayersContainer.Verify(x => x.CreateItemAsync(
            It.Is<Player>(player => TestHelpers.CompareProto(expectedPlayer, player)),
            new PartitionKey(newPlayer.id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
    }
}