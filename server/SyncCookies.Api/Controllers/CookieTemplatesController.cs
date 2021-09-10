using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SyncCookies.Api.Dtos.CookieTemplates;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;
using SyncCookies.Services;
using SyncCookies.Services.Hubs;

namespace SyncCookies.Api.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/cookies/templates")]
    [ApiController]
    public class CookieTemplatesController : ControllerBase
    {
        private readonly ICookieTemplateRepository _cookieTemplateRepo;
        private readonly IClientRepository _clientRepo;
        private readonly ICookieRepository _cookieRepo;
        private readonly IHubContext<CookieHub> _cookieHub;
        private readonly IConnectionMapping<string> _connectionMapping;
        private readonly IResourceRepository _resourceRepo;
        private readonly IUserRepository _userRepo;

        public CookieTemplatesController(ICookieTemplateRepository cookieTemplateRepo, IClientRepository clientRepo, ICookieRepository cookieRepo,
            IHubContext<CookieHub> cookieHub, IConnectionMapping<string> connectionMapping, IResourceRepository resourceRepo, IUserRepository userRepo)
        {
            _cookieTemplateRepo = cookieTemplateRepo;
            _clientRepo = clientRepo;
            _cookieRepo = cookieRepo;
            _cookieHub = cookieHub;
            _connectionMapping = connectionMapping;
            _resourceRepo = resourceRepo;
            _userRepo = userRepo;
        }

        [HttpGet("{resourceId}")]
        public async Task<IActionResult> GetAsync(Guid resourceId)
        {
            var templates = await _cookieTemplateRepo.GetByResourceAsync(resourceId);

            return Ok(templates);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(NewCookieTemplateDto newCookieTemplateDto)
        {
            var cookieTemplate = new CookieTemplate
            {
                Domain = newCookieTemplateDto.Domain,
                Name = newCookieTemplateDto.Name,
                ResourceId = newCookieTemplateDto.ResourceId
            };

            await _cookieTemplateRepo.CreateAsync(cookieTemplate);
            await _cookieTemplateRepo.SaveChangesAsync();

            // Добавляем новые шаблоны в куки
            var clients = await _clientRepo.GetByResourceAsync(newCookieTemplateDto.ResourceId);
            var cookies = clients.Data.Select(t => new Cookie
            {
                ClientId = t.Id,
                CookieTemplateId = cookieTemplate.Id
            }).ToArray();

            await _cookieRepo.CreateRangeCookieAsync(cookies);
            await _cookieRepo.SaveChangesAsync();

            // TODO: Уведомлять всех пользователей что теперь по такому что куку нужно отправлять значение
            //var users = 

            //var connection = _connectionMapping.GetConnections(user.Email);
            //await _cookieHub.Clients.AllExcept(new string[] { connection.SingleOrDefault() }).SendAsync("NewCookie", new 
            //{ 
            //    id = cookie.Id,
            //    value = cookie.Value,
            //    name = template.Name,
            //    url = resource.Url
            //});

            return Ok(cookieTemplate);
        }

        [HttpPut("{templateId}")]
        public async Task<IActionResult> UpdateAsync(Guid templateId, NewCookieTemplateDto newCookieTemplateDto)
        {
            if (templateId == Guid.Empty)
            {
                return BadRequest($"Param {nameof(templateId)} is empty");
            }

            var resource = await _resourceRepo.GetAsync(newCookieTemplateDto.ResourceId);
            if (resource == null)
            {
                return BadRequest($"Resource {newCookieTemplateDto.ResourceId} not found");
            }

            var template = await _cookieTemplateRepo.GetByTemplateAsync(templateId);
            if (template == null)
            {
                return NotFound($"Template {templateId} not found");
            }

            template.ResourceId = newCookieTemplateDto.ResourceId;
            template.Name = newCookieTemplateDto.Name;
            template.Domain = newCookieTemplateDto.Domain;

            _cookieTemplateRepo.Update(template);
            await _cookieTemplateRepo.SaveChangesAsync();

            // send new cookie by resource id
            // templateId and resourceId -> users
            /*
            var resources = await _clientRepo.GetByResourceAsync(newCookieTemplateDto.ResourceId);
            foreach (var item in resources.Data)
            {
                var cookies = await _cookieRepo.GetByClientIdAsync(item.Id);
                // этот кук полетит всем пользователям данног оклиента
                var cookie = cookies.Data.SingleOrDefault(t => t.CookieTemplateId == templateId);

                var users = await _userRepo.GetByClientIdAsync(item.Id);
                var emails = users.Select(t => t.Email);
                var connectionIds = _connectionMapping.GetConnectionsByKeys(emails);

                await _cookieHub.Clients.Clients(connectionIds.ToList()).SendAsync("NewCookie", new
                { 
                    id = cookie.Id,
                    value = cookie.Value,
                    //expirationDate = cookie.ExpirationDate,
                    name = template.Name,
                    url = resource.Url
                });
            } 
            */

            return Ok($"Template {templateId} updated");
        }

        [HttpDelete("{templateId}")]
        public async Task<IActionResult> RemoveAsync(Guid templateId)
        {
            var template = await _cookieTemplateRepo.GetByTemplateAsync(templateId);

            if (template == null)
            {
                return NotFound();
            }

            _cookieTemplateRepo.Remove(template);
            await _cookieTemplateRepo.SaveChangesAsync();

            // TODO: Уведомлять всех пользователей что теперь по такому что куку не нужно отправлять значение

            return Ok("Успешно удалено");
        }
    }
}
