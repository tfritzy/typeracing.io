using System;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Collections.Generic;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Text.Json;
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api
{
    public class RegisterHost
    {
        private readonly CosmosClient _cosmosClient;
        private readonly string _databaseName = "aces";
        private readonly string _containerName = "typeracing-hosts";
        private readonly HashSet<string> _allowedIPs;
        private readonly string _apiKey;

        public RegisterHost(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
            _apiKey = Environment.GetEnvironmentVariable("HostRegistrationKey")!;
            _allowedIPs = new HashSet<string>(
                Environment
                .GetEnvironmentVariable("AllowedIps")!
                .Split(",")
                .Select(s => s.Trim()));
        }

        [Function("register")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
        {
            string? clientIP = req.HttpContext.Connection.RemoteIpAddress?.ToString();
            if (String.IsNullOrEmpty(clientIP) || !_allowedIPs.Contains(clientIP))
            {
                return new BadRequestObjectResult("Don't know you");
            }

            if (!req.Headers.TryGetValue("X-API-Key", out var apiKeyValues) ||
                apiKeyValues.FirstOrDefault() != _apiKey)
            {
                return new BadRequestObjectResult("Invalid API key");
            }

            try
            {
                var requestBody = await JsonSerializer.DeserializeAsync<HostRegistration>(
                    req.Body,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                var host = new Host(
                    id: GenerateHostId(),
                    ip: clientIP
                );

                var container = _cosmosClient.GetContainer(_databaseName, _containerName);

                List<string> existingEntries = await HostHelpers.FindExistingEntries(container, clientIP);
                await HostHelpers.DeleteHosts(container, existingEntries);

                await container.CreateItemAsync(host, new PartitionKey("hosts"));

                return new OkObjectResult("Host registered successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex}");
                return new ObjectResult(new
                {
                    error = "Internal server error",
                    message = "An unexpected error occurred while processing the request"
                })
                {
                    StatusCode = 500
                };
            }
        }

        private string GenerateHostId()
        {
            return $"host_{Guid.NewGuid():N}";
        }

        private async Task<HttpResponseData> CreateErrorResponse(
            HttpRequestData req,
            HttpStatusCode statusCode,
            string message)
        {
            var response = req.CreateResponse(statusCode);
            await response.WriteAsJsonAsync(new { error = message });
            return response;
        }
    }
}