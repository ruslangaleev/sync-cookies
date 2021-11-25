using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using SyncCookies.Api.Dtos.V2Cookies;
using SyncCookies.Data.Repositories;
using SyncCookies.Services;
using SyncCookies.Services.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SyncCookies.Api.Controllers
{
    [Authorize]
    [Route("api/v2/cookies")]
    [ApiController]
    public class V2CookiesController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IUserRepository _userRepo;
        private readonly ICacheService _cacheService;
        private readonly IConnectionMapping<string> _connectionMapping;
        private readonly IHubContext<CookieHub> _cookieHub;
        private readonly IResourceRepository _resourceRepo;

        public V2CookiesController(IClientRepository clientRepo, IUserRepository userRepo, ICacheService cacheService, IConnectionMapping<string> connectionMapping, IHubContext<CookieHub> cookieHub,
            IResourceRepository resourceRepo)
        {
            _clientRepo = clientRepo;
            _userRepo = userRepo;
            _cacheService = cacheService;
            _connectionMapping = connectionMapping;
            _cookieHub = cookieHub;
            _resourceRepo = resourceRepo;
        }

        [HttpPost]
        public async Task<IActionResult> NewCookies(NewCookie newCookie)
        {
            try
            {
                var client = await _clientRepo.GetByClientAsync(newCookie.ClientId);
                if (client == null)
                {
                    return BadRequest($"Client not found by {nameof(newCookie.ClientId)}: {newCookie.ClientId}");
                }

                // TODO: Новые куки ложим в кэш под clientId
                //var json = JsonConvert.SerializeObject(newCookie);

                var dic = _cacheService.Get<Dictionary<string, NewCookie>>(newCookie.ClientId.ToString());
                if (dic == null)
                {
                    dic = new Dictionary<string, NewCookie>();
                    dic.Add(newCookie.Name, newCookie);
                    _cacheService.Set(newCookie.ClientId.ToString(), dic);
                }
                else
                {
                    if (dic.ContainsKey(newCookie.Name))
                    {
                        dic[newCookie.Name] = newCookie;
                    }
                    else
                    {
                        dic.Add(newCookie.Name, newCookie);
                    }

                    _cacheService.Set(newCookie.ClientId.ToString(), dic);
                }

                //_cacheService.Set<NewCookie>(newCookie.ClientId.ToString(), newCookie);

                var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
                var user = await _userRepo.GetAsync(emailClaim.Value);

                // TODO: Раздаем всем куки кто подключен по сокету
                var channels = await _clientRepo.GetChannelsAsync(newCookie.ClientId);
                var userIds = channels.Select(t => t.UserId);
                var users = await _userRepo.GetByUserIdsAsync(userIds);
                var emails = users.Where(t => t.Email != user.Email).Select(t => t.Email);
                //var connection = _connectionMapping.GetConnections(user.Email);
                // получаем список всех пользователей текущего client и кроме текущего пользователя
                var connectionIds = _connectionMapping.GetConnectionsByKeys(emails);
                // TODO: а вот и ошибка - отправить всем кроме себя, а нужно отправить только своей подгруппе
                await _cookieHub.Clients.Clients(connectionIds.ToList()).SendAsync("NewCookie", new
                {
                    clientId = newCookie.ClientId,
                    domain = newCookie.Domain,
                    expirationDate = newCookie.ExpirationDate,
                    httpOnly = newCookie.HttpOnly,
                    name = newCookie.Name,
                    path = newCookie.Path,
                    value = newCookie.Value,
                    url = newCookie.Url
                });

                return Ok("OK");
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCookies()
        {
            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);

            if (user == null)
            {
                return BadRequest(new
                {
                    errorMessage = "Текущий пользователь не найден"
                });
            }

            var clients = await _clientRepo.GetByUserAsync(user.Id);

            // Из кеша достаем все куки по clientId Формируем ответ с данными
            var list = new List<object>();

            try
            {
                foreach (var item in clients.Data)
                {
                    var dic = _cacheService.Get<Dictionary<string, NewCookie>>(item.Id.ToString());

                    if (dic == null)
                    {
                        continue;
                    }

                    var resource = await _resourceRepo.GetAsync(item.ResourceId);

                    foreach (var dicitem in dic)
                    {
                        if (dicitem.Value == null)
                        {
                            continue;
                        }

                        list.Add(new
                        {
                            clientId = item.Id.ToString(),
                            value = dicitem.Value.Value,
                            path = dicitem.Value.Path,
                            name = dicitem.Value.Name,
                            httpOnly = dicitem.Value.HttpOnly,
                            expirationDate = dicitem.Value.ExpirationDate,
                            domain = dicitem.Value.Domain,
                            url = resource.Url
                        });
                    }
                }
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok(list);
        }

        // Удаление кука
        [HttpDelete]
        public async Task<IActionResult> RemoveCookie(RemoveCookie removeCookie)
        {
            var dic = _cacheService.Get<Dictionary<string, NewCookie>>(removeCookie.ClientId.ToString());

            if (dic == null)
            {
                return BadRequest($"Нет кука {removeCookie.Name} для удаления");
            }

            if (dic.ContainsKey(removeCookie.Name))
            {
                dic[removeCookie.Name] = null;
                _cacheService.Set(removeCookie.ClientId.ToString(), dic);
            }

            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);

            // TODO: Раздаем всем куки кто подключен по сокету
            var channels = await _clientRepo.GetChannelsAsync(removeCookie.ClientId);
            var userIds = channels.Select(t => t.UserId);
            var users = await _userRepo.GetByUserIdsAsync(userIds);
            var emails = users.Where(t => t.Email != user.Email).Select(t => t.Email);
            //var connection = _connectionMapping.GetConnections(user.Email);
            // получаем список всех пользователей текущего client и кроме текущего пользователя
            var connectionIds = _connectionMapping.GetConnectionsByKeys(emails);
            // TODO: а вот и ошибка - отправить всем кроме себя, а нужно отправить только своей подгруппе
            await _cookieHub.Clients.Clients(connectionIds.ToList()).SendAsync("RemoveCookie", new
            {
                name = removeCookie.Name,
                url = removeCookie.Url
            });

            return Ok("OK");
        }

        [HttpGet("clients")] // TODO: Временно, для тестирования. URL не в положенном месте находится
        public async Task<IActionResult> GetClients()
        {
            var emailClaim = User.Claims.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType).Single();
            var user = await _userRepo.GetAsync(emailClaim.Value);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var clients = await _clientRepo.GetByUserAsync(user.Id);

            var list = new List<object>();

            foreach (var item in clients.Data)
            {
                var resource = await _resourceRepo.GetAsync(item.ResourceId);

                list.Add(new
                {
                    clientId = item.Id.ToString(),
                    url = resource.Url
                });
            }

            return Ok(list);
        }
    }
}
