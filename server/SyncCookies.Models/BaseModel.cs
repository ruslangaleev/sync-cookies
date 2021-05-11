using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class BaseModel
    {
        public Guid Id { get; set; }

        public DateTime CreateAt { get; set; }

        public DateTime UpdateAt { get; set; }
    }
}
