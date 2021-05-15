using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SyncCookies.Api.Dtos.Cookies;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;
using SyncCookies.Services;
using SyncCookies.Services.Hubs;

namespace SyncCookies.Api.Controllers
{
    [Authorize]
    [Route("api/cookies")]
    [ApiController]
    public class CookiesController : ControllerBase
    {
        private readonly ICookieRepository _cookieRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IHubContext<CookieHub> _cookieHub;
        private readonly UserRepository _userRepo;
        private readonly IResourceRepository _resourceRepo;
        private readonly ICookieTemplateRepository _cookieTemplateRepo;
        private readonly IConnectionMapping<string> _connectionMapping;

        public CookiesController(ICookieRepository cookieRepo, IHubContext<CookieHub> cookieHub, UserRepository userRepo, IConnectionMapping<string> connectionMapping,
            IClientRepository clientRepo, IResourceRepository resourceRepo, ICookieTemplateRepository cookieTemplateRepo)
        {
            _cookieRepo = cookieRepo;
            _cookieHub = cookieHub;
            _userRepo = userRepo;
            _connectionMapping = connectionMapping;
            _clientRepo = clientRepo;
            _resourceRepo = resourceRepo;
            _cookieTemplateRepo = cookieTemplateRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetCookies(Guid cookieId)
        {
            var cookie = await _cookieRepo.GetAsync(cookieId);

            if (cookie == null)
            {
                return NotFound();
            }

            return Ok(cookie);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateCookie(NewCookieDto newCookie)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Невалидные данные");
            }

            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);

            var cookie = await _cookieRepo.GetAsync(newCookie.CookieId);

            if (cookie == null)
            {
                return NotFound();
            }

            if (cookie.Value == newCookie.Value)
            {
                return BadRequest();
            }

            cookie.Value = newCookie.Value;

            _cookieRepo.UpdateCookie(cookie);
            await _cookieRepo.SaveChangesAsync();

            var connection = _connectionMapping.GetConnections(user.Email);
            await _cookieHub.Clients.AllExcept(new string[] { connection.SingleOrDefault() }).SendAsync("NewCookie", newCookie);

            return Ok("Куки обновлены");
        }
    }
}
