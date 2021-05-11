using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class ResourceInfo : BaseModel
    {
        public string Url { get; set; }

        public virtual IEnumerable<ActualCookie> ActualCookies { get; set; }
    }
}
