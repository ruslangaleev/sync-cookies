using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Models
{
    public class User : BaseModel
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public Guid ClientId { get; set; }

        public string AccessToken { get; set; }
    }
}
