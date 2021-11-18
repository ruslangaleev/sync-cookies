using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.V2Cookies
{
    public class NewCookie
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public string Domain { get; set; }

        public float ExpirationDate { get; set; }

        public bool HttpOnly { get; set; }

        public string Path { get; set; }

        public Guid ClientId { get; set; }

        public string Url { get; set; }
    }
}
