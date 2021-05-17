using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Api.Dtos.Clients;
using SyncCookies.Api.Dtos.Cookies;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;

namespace SyncCookies.Api.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/clients")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IResourceRepository _resourceRepo;
        private readonly IUserRepository _userRepo;
        private readonly ICookieRepository _cookieRepo;
        private readonly ICookieTemplateRepository _cookieTemplateRepo;

        public ClientsController(IClientRepository clientRepo, IResourceRepository resourceRepo, IUserRepository userRepo, ICookieRepository cookieRepo,
            ICookieTemplateRepository cookieTemplateRepo)
        {
            _clientRepo = clientRepo;
            _resourceRepo = resourceRepo;
            _userRepo = userRepo;
            _cookieRepo = cookieRepo;
            _cookieTemplateRepo = cookieTemplateRepo;
        }

        [HttpGet("{resourceId}")]
        public async Task<IActionResult> GetByResourceAsync(Guid resourceId)
        {
            var clients = await _clientRepo.GetByResourceAsync(resourceId);

            return Ok(clients);
        }

        [HttpGet]
        public async Task<IActionResult> GetByClientAsync(Guid clientId)
        {
            var client = await _clientRepo.GetByClientAsync(clientId);
            var cookies = await _cookieRepo.GetByClientIdAsync(clientId);

            return Ok(new
            {
                id = client.Id,
                name = client.Name,
                cookies = cookies.Data.Select(async t =>
                {
                    var cookieName = await _cookieTemplateRepo.GetByTemplateAsync(t.CookieTemplateId);

                    return new
                    {
                        id = t.Id,
                        value = t.Value,
                        name = cookieName.Name
                    };
                })
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create(NewClientDto contract)
        {
            var resource = await _resourceRepo.GetAsync(contract.ResourceId, include: true);
            if (resource == null)
            {
                return NotFound("Не найден");
            }

            var cookieName = resource.Clients.SingleOrDefault(t => t.Name == contract.Name);
            if (cookieName != null)
            {
                return BadRequest("Такое наименование уже существует");
            }

            var client = new Client
            {
                Name = contract.Name,
                ResourceId = contract.ResourceId
            };

            await _clientRepo.CreateClientAsync(client);
            await _clientRepo.SaveChangesAsync();

            // Из шаблонов берем список куков и заполняем.
            var cookies = resource.CookieTemplates.Select(t => new Cookie
            {
                ClientId = client.Id,
                CookieTemplateId = t.Id
            }).ToArray();

            await _cookieRepo.CreateRangeCookieAsync(cookies);

            await _cookieRepo.SaveChangesAsync();

            return Ok(new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
                Cookies = cookies.Select(async t =>
                {
                    var cookieTemplate = await _cookieTemplateRepo.GetByTemplateAsync(t.CookieTemplateId);
                    return new CookieDto 
                    { 
                        Value = t.Value,
                        Id = t.Id,
                    };
                }).Select(t => t.Result).ToArray()
            });
        }

        /// <summary>
        /// Добавляет пользователя к клиенту.
        /// </summary>
        /// <returns></returns>
        [HttpPost("{clientId}/users/{userId}")]
        public async Task<IActionResult> AddUserAsync(Guid clientId, Guid userId)
        {
            var client = await _clientRepo.GetByClientAsync(clientId);
            if (client == null)
            {
                return BadRequest("Клиент не найден");
            }

            var user = await _userRepo.GetAsync(userId);
            if (user == null)
            {
                return BadRequest("Пользователь не найден");
            }

            await _clientRepo.CreateChannelAsync(new Channel
            {
                ClientId = clientId,
                UserId = userId
            });
            await _clientRepo.SaveChangesAsync();

            return Ok("Подписка успешно создана");
        }

        [HttpDelete("{clientId}")]
        public async Task<IActionResult> RemoveAsync(Guid clientId)
        {
            var client = await _clientRepo.GetByClientAsync(clientId);
            if (client == null)
            {
                return NotFound("Не найден");
            }

            await _clientRepo.RemoveAsync(client);

            return Ok();
        }
    }
}
