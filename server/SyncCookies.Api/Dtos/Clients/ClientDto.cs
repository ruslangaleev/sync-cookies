using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SyncCookies.Api.Dtos.Cookies;
using SyncCookies.Models;

namespace SyncCookies.Api.Dtos.Clients
{
    public class ClientDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public CookieDto[] Cookies { get; set; }
    }
}
