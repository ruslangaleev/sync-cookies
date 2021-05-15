using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    /// <summary>
    /// Информация о куке, которую необходимо синхронизировать.
    /// </summary>
    public class CookieTemplate : BaseModel
    {
        public string Name { get; set; }

        public string Domain { get; set; }

        public Guid ResourceId { get; set; }
        public virtual Resource Resource { get; set; }
    }
}
