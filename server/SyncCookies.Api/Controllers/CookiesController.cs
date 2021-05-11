using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SyncCookies.Api.Dtos.Cookies;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;
using SyncCookies.Services.Hubs;

namespace SyncCookies.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CookiesController : ControllerBase
    {
        private readonly ICookieRepository _cookieRepo;
        private readonly IHubContext<CookieHub> _cookieHub;

        public CookiesController(ICookieRepository cookieRepo, IHubContext<CookieHub> cookieHub)
        {
            _cookieRepo = cookieRepo;
            _cookieHub = cookieHub;
        }

        [HttpGet]
        public async Task<IActionResult> GetCookies(string url, string name)
        {
            if (string.IsNullOrEmpty(url))
            {
                return BadRequest();
            }

            if (string.IsNullOrEmpty(name))
            {
                return BadRequest();
            }

            var actualCookie = await _cookieRepo.GetActualCookieAsync(url, name);

            if (actualCookie == null)
            {
                return NotFound();
            }

            return Ok(new {
                name = actualCookie.Name,
                value = actualCookie.Value,
                domain = actualCookie.Domain,
                url = actualCookie.ResourceCookie.Url
            });
        }

        [HttpPost("resources")]
        public async Task<IActionResult> AddResourceInfoAsync(NewResourceInfoDto newResourceInfo)
        {
            var resourceInfo = new ResourceInfo
            {
                Url = newResourceInfo.Url
            };

            await _cookieRepo.CreateResourceInfoAsync(new ResourceInfo
            {
                Url = newResourceInfo.Url
            });

            await _cookieRepo.SaveChangesAsync();

            return Ok("Источник добавлен");
        }

        [HttpPost]
        public async Task<IActionResult> UpdateCookie(NewCookieDto newCookie)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Невалидные данные");
            }

            var resourceCookie = await _cookieRepo.GetResourceCookieAsync(newCookie.Url);
            if (resourceCookie == null)
            {
                return BadRequest($"Указанный {newCookie.Url} не найден");
            }

            var actualCookie = await _cookieRepo.GetActualCookieAsync(newCookie.Url, newCookie.Name);
            if (actualCookie == null)
            {
                await _cookieRepo.CreateActualCookieAsync(new ActualCookie
                {
                    Domain = newCookie.Domain,
                    Name = newCookie.Name,
                    Value = newCookie.Value,
                    ResourceCookieId = resourceCookie.Id
                });
            }
            else
            {
                if (actualCookie.Value == newCookie.Value)
                {
                    return BadRequest("Попытка повторно обновить куки");
                }

                actualCookie.Value = newCookie.Value;
                actualCookie.Domain = newCookie.Domain;

                _cookieRepo.UpdateActualCookie(actualCookie);
            }

            await _cookieRepo.SaveChangesAsync();

            // await _cookieHub.Clients.All.SendAsync("NewCookie", newCookie);
            await _cookieHub.Clients.AllExcept(new string[] {  }).SendAsync("NewCookie", newCookie);

            return Ok("Куки обновлены");
        }
    }
}
