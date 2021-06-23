using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class Cookie : BaseModel
    {
        public string Value { get; set; }
        public float? ExpirationDate { get; set; }

        public Guid ClientId  { get; set; }
        public virtual Client Client { get; set; }

        public Guid CookieTemplateId { get; set; }
        public virtual CookieTemplate CookieTemplate { get; set; }
    }
}
