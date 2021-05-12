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
    [Route("api/[controller]")]
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
        public async Task<IActionResult> CreateUserAsync(Guid clientId, string firstName, string lastName)
        {
            if (Guid.Empty == clientId)
            {
                return BadRequest($"Не указан {nameof(clientId)}");
            }

            var client = await _clientRepo.GetAsync(clientId);
            if (client == null)
            {
                return BadRequest($"Клиент с идентификатором {clientId} не найден");
            }

            var email = Guid.NewGuid().ToString();
            var token = TokenGenerator.GenerateTokenForUser(email);

            var user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                ClientId = clientId,
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
                user.ClientId,
                user.CreateAt,
                user.UpdateAt,
                access_token = token
            });
        }

    }
}
