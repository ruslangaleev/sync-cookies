using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.Clients
{
    public class NewClientDto
    {
        /// <summary>
        /// Это может быть логин, электронная почта или любое значение. Она больше информационное
        /// </summary>
        public string Name { get; set; }

        public Guid ResourceId { get; set; }
    }
}
