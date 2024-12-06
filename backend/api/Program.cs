using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Azure.Cosmos;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        services.AddSingleton((s) => new CosmosClient(Environment.GetEnvironmentVariable("CosmosDBConnectionString")));
        services.AddHttpClient();
        services.AddLogging();
    })
    .Build();

host.Run();
