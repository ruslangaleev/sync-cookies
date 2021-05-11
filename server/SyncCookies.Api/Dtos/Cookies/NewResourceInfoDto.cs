using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SyncCookies.Api.Dtos.Cookies
{
    /// <summary>
    /// Информация об источнике, у которого будем синхронизировать куки.
    /// </summary>
    public class NewResourceInfoDto
    {
        public string Url { get; set; }
    }
}
