using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;
using SyncCookies.Services;

namespace SyncCookies.Api.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IUserRepository _userRepo;
        private readonly IConnectionMapping<string> _connectionMapping;

        public UsersController(IClientRepository clientRepo, IUserRepository userRepo, IConnectionMapping<string> connectionMapping)
        {
            _clientRepo = clientRepo;
            _userRepo = userRepo;
            _connectionMapping = connectionMapping;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepo.GetAllAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUserAsync(string firstName, string lastName)
        {
            var email = Guid.NewGuid().ToString();
            var token = TokenGenerator.GenerateTokenForUser(email);

            var user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                AccessToken = token
            };

            await _userRepo.AddAsync(user);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreateAt,
                user.UpdateAt,
                access_token = token
            });
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteAsync(Guid userId)
        {
            if (Guid.Empty == userId)
            {
                return BadRequest("Идентификатор пользователя не указан");
            }

            var user = await _userRepo.GetAsync(userId);
            if (user == null)
            {
                return BadRequest("Указанный пользователь не найден");
            }

            await _userRepo.RemoveAsync(userId);

            return Ok("Пользователь успешно удален");
        }

        [HttpGet("online")]
        public async Task<IActionResult> GetAllUsersOnlineAsync()
        {
            var users = await _userRepo.GetAllAsync();

            var result = new List<object>();

            foreach (var user in users)
            {
                var connection = _connectionMapping.GetConnectionsByKey(user.Email);
                result.Add(new
                {
                    user = new {
                        id = user.Id,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email,
                        connectionIds = connection.ToArray()
                    }
                });
            }

            return Ok(result);
        }

        [HttpGet("{userId}/clients")]
        public async Task<IActionResult> GetClientsASync(Guid userId)
        {
            //if (userId == Guid.Empty)
            //{
            //    return BadRequest($"Не указан userId. Значение: {userId}");
            //}

            //var user = await _userRepo.GetAsync(userId);
            //if (user == null)
            //{
            //    return NotFound($"Пользователь {userId} не найден");
            //}

            //var clients = await _clientRepo.GetClientsByUserIdAsync(userId);

            //var result = clients.Select(t => new {
            //    url = t.Resource.Url,                
            //    name = t.Name
            //});


            return Ok();
        }
    }
}
