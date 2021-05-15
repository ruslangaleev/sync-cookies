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

        public CookieTemplatesController(ICookieTemplateRepository cookieTemplateRepo)
        {
            _cookieTemplateRepo = cookieTemplateRepo;
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

            return Ok("Успешно удалено");
        }
    }
}
