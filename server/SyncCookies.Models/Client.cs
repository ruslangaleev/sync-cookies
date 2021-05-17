using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class Client : BaseModel
    {
        /// <summary>
        /// Любое наименование: Email аккаунта, логин, ФИО и т.д.
        /// </summary>
        public string Name { get; set; }

        public Guid ResourceId { get; set; }
        public virtual Resource Resource { get; set; }

        public virtual IEnumerable<Cookie> Cookies { get; set; }
    }
}
