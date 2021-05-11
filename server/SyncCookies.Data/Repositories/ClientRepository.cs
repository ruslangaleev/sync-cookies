using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface IClientRepository
    {
        Task<Page<Client>> GetAll();
        Task<Client> GetAsync(Guid clientId);
        Task<Guid> Create(Client client);
        Task Remove(Guid id);
    }

    public class ClientRepository : IClientRepository
    {
        private readonly ApplicationContext _context;

        public ClientRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task<Guid> Create(Client client)
        {
            client.CreateAt = DateTime.UtcNow;
            client.UpdateAt = DateTime.UtcNow;

            await _context.Clients.AddAsync(client);
            await _context.SaveChangesAsync();

            return client.Id;
        }

        public async Task<Client> GetAsync(Guid clientId)
        {
            return await _context.Clients.FindAsync(clientId);
        }

        public async Task<Page<Client>> GetAll()
        {
            var items = await _context.Clients.ToListAsync();

            return new Page<Client>
            {
                Data = items,
                PageCount = 1000,
                PageNumber = 1,
                TotalCount = items.Count
            };
        }

        public async Task Remove(Guid id)
        {
            var client = await _context.Clients.SingleOrDefaultAsync(t => t.Id == id);
            if (client == null)
            {
                return;
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
        }
    }
}
