using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;
using SyncCookies.Services;

namespace SyncCookies.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;
        private readonly IUserRepository _userRepo;

        public UsersController(IClientRepository clientRepo, IUserRepository userRepo)
        {
            _clientRepo = clientRepo;
            _userRepo = userRepo;
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
    }
}
