using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SyncCookies.Api.Dtos.Clients;
using SyncCookies.Data.Repositories;
using SyncCookies.Models;

namespace SyncCookies.Api.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepository _clientRepo;

        public ClientController(IClientRepository clientRepo)
        {
            _clientRepo = clientRepo;
        }

        [HttpPost]
        public async Task<IActionResult> Create(NewClientDto contract)
        {
            var client = new Client
            {
                Name = contract.Name
            };

            var id = await _clientRepo.Create(client);

            return Ok(new 
            {
                id = id,
                name = client.Name
            });
        }
    }
}
