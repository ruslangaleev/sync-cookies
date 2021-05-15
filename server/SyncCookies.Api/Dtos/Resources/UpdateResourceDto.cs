using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.Resources
{
    public class UpdateResourceDto : ResourceBaseDto
    {
        public Guid Id { get; set; }
    }
}
