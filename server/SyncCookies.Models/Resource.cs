using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class Resource : BaseModel
    {
        /// <summary>
        /// Полный адрес где хранятся куки.
        /// </summary>
        public string Url { get; set; }

        public virtual IEnumerable<Client> Clients { get; set; }

        public virtual IEnumerable<CookieTemplate> CookieTemplates { get; set; }
    }
}
