using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.V2Cookies
{
    public class RemoveCookie
    {
        public Guid ClientId { get; set; }

        public string Name { get; set; }

        public string Url { get; set; }
    }
}
