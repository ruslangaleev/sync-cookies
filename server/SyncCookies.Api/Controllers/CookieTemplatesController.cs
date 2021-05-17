using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Api.Dtos.CookieTemplates;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;

namespace SyncCookies.Api.Controllers
{
    [Route("api/cookies/templates")]
    [ApiController]
    public class CookieTemplatesController : ControllerBase
    {
        private readonly ICookieTemplateRepository _cookieTemplateRepo;
        private readonly IClientRepository _clientRepo;
        private readonly ICookieRepository _cookieRepo;

        public CookieTemplatesController(ICookieTemplateRepository cookieTemplateRepo, IClientRepository clientRepo, ICookieRepository cookieRepo)
        {
            _cookieTemplateRepo = cookieTemplateRepo;
            _clientRepo = clientRepo;
            _cookieRepo = cookieRepo;
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

            return Ok(cookieTemplate);
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

            // TODO: Уведомлять всех пользователей что теперь по такому что куку не нужно отправлять значение

            return Ok("Успешно удалено");
        }
    }
}
