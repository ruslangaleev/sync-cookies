using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface IClientRepository
    {
        Task<Page<Client>> GetByResourceAsync(Guid resourceId);
        Task<Client> GetAsync(Guid clientId);
        Task CreateClientAsync(Client client);
        Task CreateChannelAsync(Channel channel);
        Task RemoveAsync(Client client);
        Task SaveChangesAsync();
    }

    public class ClientRepository : IClientRepository
    {
        private readonly ApplicationContext _context;

        public ClientRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task CreateChannelAsync(Channel channel)
        {
            await _context.Channels.AddAsync(channel);
        }

        public async Task CreateClientAsync(Client client)
        {
            client.CreateAt = DateTime.UtcNow;
            client.UpdateAt = DateTime.UtcNow;

            await _context.Clients.AddAsync(client);
        }

        public async Task<Client> GetAsync(Guid clientId)
        {
            return await _context.Clients.FindAsync(clientId);
        }

        public async Task<Page<Client>> GetByResourceAsync(Guid resourceId)
        {
            var clients = await _context.Clients.Where(t => t.ResourceId == resourceId).ToListAsync();

            return new Page<Client>
            {
                Data = clients,
                PageCount = 1000,
                PageNumber = 1,
                TotalCount = clients.Count
            };
        }

        public async Task RemoveAsync(Client client)
        {
            _context.Clients.Remove(client);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
