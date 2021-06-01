using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.CookieTemplates
{
    public class NewCookieTemplateDto
    {
        public string Name { get; set; }

        public string Domain { get; set; }

        public Guid ResourceId { get; set; }
    }
}
