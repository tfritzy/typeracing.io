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
        public Mock<Container> TrialResultsContainer;

        public TestSetup(Player player, TimeTrial timeTrial, CosmosClient client, Mock<Container> trialResultsContainer)
        {
            Player = player;
            Trial = timeTrial;
            Client = client;
            TrialResultsContainer = trialResultsContainer;
        }
    }

    private TestSetup SetupWorld()
    {
        var playerContainer = new Mock<Container>();
        playerContainer.Name = DBConst.Players;
        Player player = Builders.BuildAnonPlayer(1);
        TestHelpers.InsertPlayer(playerContainer, player);
        Player? capturedPlayer = null;
        playerContainer
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

        var trialContainer = new Mock<Container>();
        trialContainer.Name = DBConst.TimeTrials;
        TimeTrial timeTrial = Builders.BuildTimeTrial(1);
        TestHelpers.InsertTrial(trialContainer, timeTrial);

        var trialResultsContainer = new Mock<Container>();
        trialResultsContainer.Name = DBConst.TimeTrialResults;

        var client = TestHelpers.BuildFakeClient([playerContainer, trialContainer, trialResultsContainer]);
        var function = new ReportTimeTrialResult(client);
        var claimsPrincipal = ClaimsPrincipalFactory.CreateAnonymous();

        return new TestSetup(player, timeTrial, client, trialResultsContainer);
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
        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { Id = "trial_001" };
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

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { Id = "trial_nonexistant" };
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

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { Id = setup.Trial.Id };
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
    public void OkRequest_UpdatesExistingResult()
    {
        TestSetup setup = SetupWorld();
        TimeTrialResult result = Builders.BuildTimeTrialResult(setup.Trial, setup.Player.Id);
        TestHelpers.InsertTrialResult(setup.TrialResultsContainer, result);

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { Id = setup.Trial.Id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 60));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        var deser = ReportTimeTrialRequest.Parser.ParseFrom(reqBody.ToByteArray());

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        setup.TrialResultsContainer.Verify(x => x.ReplaceItemAsync(
            It.IsAny<TimeTrialResult>(),
            setup.Trial.Id,
            It.Is<PartitionKey>(pk => pk.ToString() == new PartitionKey(setup.Player.Id).ToString()),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }

    [TestMethod]
    public void OkRequest_CreatesNewResult()
    {
        TestSetup setup = SetupWorld();

        ReportTimeTrialRequest reqBody = new ReportTimeTrialRequest() { Id = setup.Trial.Id };
        reqBody.Keystrokes.Add(TestHelpers.GetKeystrokesForPhrase(setup.Trial.Phrase, 60));
        var httpRequest = TestHelpers.MakeAnonRequest(setup.Player, reqBody);
        var function = new ReportTimeTrialResult(setup.Client);

        var deser = ReportTimeTrialRequest.Parser.ParseFrom(reqBody.ToByteArray());

        IStatusCodeActionResult response = function.Run(httpRequest, null).Result;

        var expectedItem = new TimeTrialResult()
        {
            Id = setup.Trial.Id,
            PlayerId = setup.Player.Id,
            BestTime = KeystrokeHelpers.GetTime(reqBody.Keystrokes),
        };
        expectedItem.AttemptTimes.Add(KeystrokeHelpers.GetTime(reqBody.Keystrokes));
        expectedItem.BestKeystrokes.Add(reqBody.Keystrokes);
        setup.TrialResultsContainer.Verify(x => x.CreateItemAsync(
            It.Is<TimeTrialResult>(tr => TestHelpers.CompareTrialResult(expectedItem, tr)),
            new PartitionKey(setup.Player.Id),
            It.IsAny<ItemRequestOptions>(),
            default),
            Times.Once());
        Assert.AreEqual(200, response.StatusCode);
    }
}