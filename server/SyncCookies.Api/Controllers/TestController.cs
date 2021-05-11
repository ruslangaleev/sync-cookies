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

        [HttpGet("page")]
        public async Task<IActionResult> GetPageAsync()
        {
            var rnd = new Random();

            var text = $"Тестовая страница {rnd.Next()}";

            return Ok(text);
        }

        [HttpGet("page/withcookies")]
        public async Task<IActionResult> GetPageWithCookiesAsync()
        {
            var rnd = new Random();

            var cookieName = "testcookie";
            var cookieValue = rnd.Next();

            var text = $"Тестовая страница {rnd.Next()} c изменным куком {cookieName} на значение {cookieValue}";

            Response.Cookies.Append(cookieName, cookieValue.ToString());

            return Ok(text);
        }

        /// <summary>
        /// Отправляет сообщение по сокету
        /// </summary>
        /// <param name="newCookie">Информация о передаваемом сообщений</param>
        [HttpPost("messages")]
        public async Task<IActionResult> SendTestMessageAsync(NewTestCookieDto newCookie)
        {
            await _cookieHub.Clients.All.SendAsync("NewCookie", newCookie);

            return Ok("Успешно отправлено");
        }
    }
}
