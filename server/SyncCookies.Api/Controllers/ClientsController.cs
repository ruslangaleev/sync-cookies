using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Api.Dtos.Clients;
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

        public ClientsController(IClientRepository clientRepo, IResourceRepository resourceRepo, IUserRepository userRepo, ICookieRepository cookieRepo)
        {
            _clientRepo = clientRepo;
            _resourceRepo = resourceRepo;
            _userRepo = userRepo;
            _cookieRepo = cookieRepo;
        }

        [HttpGet("{resourceId}")]
        public async Task<IActionResult> GetAsync(Guid resourceId)
        {
            var clients = await _clientRepo.GetByResourceAsync(resourceId);

            return Ok(clients);
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
            foreach (var item in resource.CookieTemplates)
            {
                await _cookieRepo.CreateCookieAsync(new Cookie
                {
                    ClientId = client.Id,
                    CookieTemplateId = item.Id,
                });
            }

            await _cookieRepo.SaveChangesAsync();

            return Ok(client);
        }

        /// <summary>
        /// Добавляет пользователя к клиенту.
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> AddUserAsync()
        {
            return Ok();
        }

        [HttpDelete("{clientId}")]
        public async Task<IActionResult> RemoveAsync(Guid clientId)
        {
            var client = await _clientRepo.GetAsync(clientId);
            if (client == null)
            {
                return NotFound("Не найден");
            }

            await _clientRepo.RemoveAsync(client);

            return Ok();
        }
    }
}
