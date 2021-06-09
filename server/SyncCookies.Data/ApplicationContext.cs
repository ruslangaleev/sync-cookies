using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Cookie> ActualCookies { get; set; }

        public DbSet<Resource> Resources { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Client> Clients { get; set; }

        public DbSet<CookieTemplate> CookieTemplates { get; set; }

        public DbSet<Channel> Channels { get; set; }

        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
        {
            // Создает базу если она отсутствует
            //Database.EnsureCreated();
            //Database.Migrate();
        }
    }
}
