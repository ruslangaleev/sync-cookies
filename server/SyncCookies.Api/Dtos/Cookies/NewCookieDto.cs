using System;
using System.ComponentModel.DataAnnotations;

namespace SyncCookies.Api.Dtos.Cookies
{
    public class NewCookieDto
    {
        public Guid CookieId { get; set; }

        [Required(ErrorMessage = "Ноебходимо указать значение кука")]
        public string Value { get; set; }
    }
}
