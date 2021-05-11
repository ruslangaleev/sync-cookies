using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class ActualCookie : BaseModel
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public string Domain { get; set; }

        public Guid ResourceCookieId { get; set; }
        public virtual ResourceInfo ResourceCookie { get; set; }
    }
}
