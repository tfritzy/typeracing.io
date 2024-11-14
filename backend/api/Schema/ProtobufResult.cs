using Google.Protobuf;
using Microsoft.AspNetCore.Mvc;

public class ProtobufResult : IActionResult
{
    private readonly IMessage _message;

    public ProtobufResult(IMessage message)
    {
        _message = message;
    }

    public async Task ExecuteResultAsync(ActionContext context)
    {
        var response = context.HttpContext.Response;
        response.ContentType = "application/x-protobuf";
        await response.Body.WriteAsync(_message.ToByteArray());
    }
}