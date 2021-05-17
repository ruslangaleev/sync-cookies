using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Data.Repositories;
using SyncCookies.Services;

namespace SyncCookies.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _password = "Mt5LmSZXHVFS";
        private readonly string _userName = "admin";
        private readonly IUserRepository _userRepo;

        public AuthController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        [HttpPost("token")]
        public async Task<IActionResult> Token(string userName, string password)
        {
            if (string.IsNullOrEmpty(userName))
            {
                return BadRequest($"Не указан {nameof(userName)}");
            }

            if (string.IsNullOrEmpty(password))
            {
                return BadRequest($"Не указан {nameof(password)}");
            }

            if (_userName != userName || _password != password)
            {
                return BadRequest($"Не верный {nameof(userName)} или {nameof(password)}");
            }

            var token = string.Empty;
            try
            {
                token = TokenGenerator.GenerateTokenForAdmin(userName);
            }
            catch(Exception e)
            {
                // Перенести в логи
                return BadRequest(e);
            }

            return Ok(new 
            {
                access_token = token
            });
        }

        //[Authorize(Roles = "ADMIN")]
        //[HttpPost("token/refresh/{userName}")]
        //public async Task<IActionResult> RefreshByUserId(string userName)
        //{
        //    if (string.IsNullOrEmpty(userName))
        //    {
        //        return BadRequest($"Не указан {nameof(userName)}");
        //    }

        //    var user = await _userRepo.GetByUserNameAsync(userName);
        //    if (user == null)
        //    {
        //        return BadRequest($"Указанный пользователь {userName} не найден");
        //    }

        //    var token = TokenGenerator.GenerateTokenForUser(user.UserName);
        //    user.AccessToken = token;
        //    await _userRepo.UpdateAsync(user);

        //    return Ok(new 
        //    {
        //        userName = userName,
        //        access_token = token
        //    });
        //}

        //[Authorize(Roles = "USER")]
        //[HttpPost("token/refresh")]
        //public async Task<IActionResult> Refresh()
        //{
        //    var userName = User.Claims?.Where(t => t.Type == ClaimsIdentity.DefaultNameClaimType)?.FirstOrDefault();

        //    var user = await _userRepo.GetByUserNameAsync(userName.Value);
        //    if (user == null)
        //    {
        //        return BadRequest("Указанный пользователь не найден");
        //    }

        //    var token = TokenGenerator.GenerateTokenForUser(userName.Value);
        //    user.AccessToken = token;
        //    await _userRepo.UpdateAsync(user);

        //    return Ok(new 
        //    {
        //        userName = user.UserName,
        //        access_token = token
        //    });
        //}
    }
}
