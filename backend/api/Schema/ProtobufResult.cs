using Google.Protobuf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

public class ProtobufResult : IStatusCodeActionResult
{
    private readonly IMessage _message;

    public ProtobufResult(IMessage message)
    {
        _message = message;
    }

    public int? StatusCode => 200;

    public async Task ExecuteResultAsync(ActionContext context)
    {
        var response = context.HttpContext.Response;
        response.ContentType = "application/x-protobuf";
        await response.Body.WriteAsync(_message.ToByteArray());
    }
}