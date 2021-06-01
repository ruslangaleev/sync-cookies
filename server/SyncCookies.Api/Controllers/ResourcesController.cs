using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Api.Dtos.Resources;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;

namespace SyncCookies.Api.Controllers
{
    /// <summary>
    /// Источник для которого будут синхронизироваться куки.
    /// </summary>
    [Authorize(Roles = "ADMIN")]
    [Route("api/resources")]
    [ApiController]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceRepository _resourceRepo;

        public ResourcesController(IResourceRepository resourceRepo)
        {
            _resourceRepo = resourceRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            var resources = await _resourceRepo.GetAsync();

            return Ok(resources);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(NewResourceDto newResourceDto)
        {
            var resource = new Resource
            {
                Url = newResourceDto.Url
            };

            await _resourceRepo.CreateAsync(resource);
            await _resourceRepo.SaveChangesAsync();

            return Ok(resource);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAsync(UpdateResourceDto updateResourceDto)
        {
            var resource = await _resourceRepo.GetAsync(updateResourceDto.Id);
            if (resource == null)
            {
                return NotFound("Не найден");
            }

            resource.Url = updateResourceDto.Url;
            _resourceRepo.Update(resource);
            await _resourceRepo.SaveChangesAsync();

            return Ok(resource);
        }

        [HttpDelete("{resourceId}")]
        public async Task<IActionResult> RemoveAsync(Guid resourceId)
        {
            var resource = await _resourceRepo.GetAsync(resourceId);
            if (resource == null)
            {
                return NotFound();
            }

            await _resourceRepo.RemoveAsync(resource);

            return Ok("Успешно удалено");
        }
    }
}
