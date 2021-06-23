using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.Cookies
{
    public class BaseCookieDto
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public float? ExpirationDate { get; set; }
    }
}
