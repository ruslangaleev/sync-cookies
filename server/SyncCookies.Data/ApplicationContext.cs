using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data
{
    public class ApplicationContext : DbContext
    {
        public DbSet<ActualCookie> ActualCookies { get; set; }

        public DbSet<ResourceInfo> ResourceInfoes { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Client> Clients { get; set; }

        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
        {
            // Создает базу если она отсутствует
            Database.EnsureCreated();
        }
    }
}
