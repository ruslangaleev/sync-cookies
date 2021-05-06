using System.ComponentModel.DataAnnotations;

namespace SyncCookies.Api.Dtos.Cookies
{
    public class NewCookie
    {
        [Required(ErrorMessage = "Необходимо указать адрес ресурса")]
        public string Url { get; set; }

        [Required(ErrorMessage = "Необходимо указать наименование кука")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Ноебходимо указать значение кука")]
        public string Value { get; set; }

        [Required(ErrorMessage = "Необходимо указать домен кука")]
        public string Domain { get; set; }
    }
}
