using System.Net;
using api;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Primitives;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Schema;

namespace Tests;

[TestClass]
public class ReportTimeTrialResultTests
{
    [TestMethod]
    public void Unauthorized_WithoutPlayerId()
    {
        var mockContainer = new Mock<Container>();
        var client = TestHelpers.BuildFakeClient(mockContainer);

        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Auth-Token", new StringValues("abc") }
            },
            body: null,
            queryParams: null
        ).Object;

        var function = new ReportTimeTrialResult(client);
        IActionResult result = function.Run(httpRequest, null).Result;
        Assert.IsTrue(result is UnauthorizedResult);
    }

    [TestMethod]
    public void Unauthorized_WithoutAuthToken()
    {
        var mockContainer = new Mock<Container>();
        var client = TestHelpers.BuildFakeClient(mockContainer);

        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Player-Id", new StringValues("abc") }
            },
            body: null,
            queryParams: null
        ).Object;

        var function = new ReportTimeTrialResult(client);
        IActionResult result = function.Run(httpRequest, null).Result;
        Assert.IsTrue(result is UnauthorizedResult);
    }

    [TestMethod]
    public void BadRequest_MissingBody()
    {
        var mockContainer = new Mock<Container>();
        Player player = Builders.BuildAnonPlayer(1);
        TestHelpers.InsertPlayer(mockContainer, player);
        var client = TestHelpers.BuildFakeClient(mockContainer);

        var httpRequest = TestHelpers.CreateMockRequest(
            headers: new Dictionary<string, StringValues>
            {
                { "X-Player-Id", new StringValues("abc") },
                { "X-Auth-Token", new StringValues("abc") }
            },
            body: null,
            queryParams: null
        ).Object;

        var function = new ReportTimeTrialResult(client);
        var claimsPrincipal = ClaimsPrincipalFactory.CreateAnonymous();
        IActionResult response = function.Run(httpRequest, claimsPrincipal).Result;

        Assert.AreEqual(typeof(BadRequestObjectResult), response.GetType());
        Assert.AreEqual("Invalid request body", (response as ObjectResult)!.Value);
    }
}