using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    // TODO: Переименовать на Sub - подписка

    public class Channel : BaseModel
    {
        public Guid ClientId { get; set; }
        public virtual Client Client { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; }
    }
}
