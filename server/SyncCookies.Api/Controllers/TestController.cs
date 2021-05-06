using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SyncCookies.Api.Dtos.Test;
using SyncCookies.Services.Hubs;

namespace SyncCookies.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IHubContext<CookieHub> _cookieHub;

        public TestController(IHubContext<CookieHub> cookieHub)
        {
            _cookieHub = cookieHub;
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendTestMessage(NewCookie newCookie)
        {
            await _cookieHub.Clients.All.SendAsync("NewCookie", newCookie);

            return Ok("Успешно отправлено");
        }
    }
}
