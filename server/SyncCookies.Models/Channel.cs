using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class Channel : BaseModel
    {
        public Guid ClientId { get; set; }
        public virtual Client Client { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }
    }
}
