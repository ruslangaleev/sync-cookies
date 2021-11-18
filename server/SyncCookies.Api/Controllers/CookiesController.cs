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
    [Route("obsolete/api/cookies")]
    [ApiController]
    public class CookiesController : ControllerBase
    {
        private readonly ICookieRepository _cookieRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IHubContext<CookieHub> _cookieHub;
        private readonly IUserRepository _userRepo;
        private readonly IResourceRepository _resourceRepo;
        private readonly ICookieTemplateRepository _cookieTemplateRepo;
        private readonly IConnectionMapping<string> _connectionMapping;

        public CookiesController(ICookieRepository cookieRepo, IHubContext<CookieHub> cookieHub, IUserRepository userRepo, IConnectionMapping<string> connectionMapping,
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

        /// <summary>
        /// Вернет все куки по всем клиентам для указанного пользователя.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetCookies()
        {
            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);

            if (user == null)
            {
                return BadRequest(new {
                    errorMessage = "Текущий пользователь не найден"
                });
            }

            var clients = await _clientRepo.GetByUserAsync(user.Id);

            var result = clients.Data.Select(t => 
            {
                return new
                {
                    ResourceId = t.ResourceId,
                    Url = t.Resource.Url,
                    ClientId = t.Id,
                    Name = t.Name,
                    Cookies = t.Cookies.Select(p =>
                    {
                        return new
                        {
                            Id = p.Id,
                            Name = p.CookieTemplate.Name,
                            Value = p.Value,
                            Domain = p.CookieTemplate.Domain,
                            ExpirationDate = p.ExpirationDate
                        };
                    })
                };
            });

            return Ok(result);
        }

        [HttpGet("{cookieId}")]
        public async Task<IActionResult> GetCookies(Guid cookieId)
        {
            var cookie = await _cookieRepo.GetByCookieIdAsync(cookieId);

            if (cookie == null)
            {
                return NotFound();
            }

            var template = await _cookieTemplateRepo.GetByTemplateAsync(cookie.CookieTemplateId);
            var resource = await _resourceRepo.GetAsync(template.ResourceId);

            return Ok(new {
                url = resource.Url,
                value = cookie.Value,
                name = template.Name,
                domain = template.Domain
            });
        }

        [HttpPut("{cookieId}")]
        public async Task<IActionResult> UpdateCookie(Guid cookieId, UpdateCookieDto cookieDto)
        {
            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);
            if (user == null)
            {
                return BadRequest("Пользователь не найден");
            }

            var cookie = await _cookieRepo.GetByCookieIdAsync(cookieId);

            if (cookie == null)
            {
                return NotFound();
            }

            if (cookie.Value == cookieDto.Value && cookie.ExpirationDate == cookieDto.ExpirationDate)
            {
                return BadRequest(new {
                    cookieId = cookieId,
                    value = cookieDto.Value,
                    expirationDate = cookieDto.ExpirationDate,
                    errorMessage = "Дублируемое значение"
                });
            }

            cookie.Value = cookieDto.Value;
            cookie.ExpirationDate = cookieDto.ExpirationDate;

            _cookieRepo.UpdateCookie(cookie);
            await _cookieRepo.SaveChangesAsync();

            var template = await _cookieTemplateRepo.GetByTemplateAsync(cookie.CookieTemplateId);
            var resource = await _resourceRepo.GetAsync(template.ResourceId);

            var channels = await _clientRepo.GetChannelsAsync(cookie.ClientId);
            var userIds = channels.Select(t => t.UserId);
            var users = await _userRepo.GetByUserIdsAsync(userIds);
            var emails = users.Where(t => t.Email != user.Email).Select(t => t.Email);
            //var connection = _connectionMapping.GetConnections(user.Email);
            // получаем список всех пользователей текущего client и кроме текущего пользователя
            var connectionIds = _connectionMapping.GetConnectionsByKeys(emails);
            // TODO: а вот и ошибка - отправить всем кроме себя, а нужно отправить только своей подгруппе
            await _cookieHub.Clients.Clients(connectionIds.ToList()).SendAsync("NewCookie", new
            { 
                id = cookie.Id,
                value = cookie.Value,
                //expirationDate = cookie.ExpirationDate,
                name = template.Name,
                url = resource.Url
            });

            return Ok("Куки обновлены");
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearAllAsync(Guid clientId)
        {
            var cookies = await _cookieRepo.GetByClientIdAsync(clientId);

            foreach (var cookie in cookies.Data)
            {
                cookie.ExpirationDate = 0;
                cookie.Value = "";
                _cookieRepo.UpdateCookie(cookie);
            }

            await _cookieRepo.SaveChangesAsync();

            return Ok("Успешно очищены");
        }
    }
}
