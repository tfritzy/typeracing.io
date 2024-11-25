using Google.Protobuf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

public class ProtobufResult : IStatusCodeActionResult
{
    private readonly IMessage _message;
    public IDictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();
    public int? StatusCode => 200;

    public ProtobufResult(IMessage message)
    {
        _message = message;
    }

    public async Task ExecuteResultAsync(ActionContext context)
    {
        var response = context.HttpContext.Response;

        foreach (var header in Headers)
        {
            response.Headers[header.Key] = header.Value;
        }

        response.ContentType = "application/x-protobuf";
        await response.Body.WriteAsync(_message.ToByteArray());
    }
}