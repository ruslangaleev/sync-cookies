﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.Cookies
{
    public class CookieDto : BaseCookieDto
    {
        public Guid Id { get; set; }
    }
}
