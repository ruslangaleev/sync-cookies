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
        Task<Client> GetByClientAsync(Guid clientId);
        Task<Page<Client>> GetByUserAsync(Guid userId);
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

        public async Task<Client> GetByClientAsync(Guid clientId)
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

        public async Task<Page<Client>> GetByUserAsync(Guid userId)
        {
            var channels = await _context.Channels.Where(t => t.UserId == userId).ToListAsync();

            var ids = channels.Select(t => t.ClientId);

            var clients = await _context.Clients
                .Include(t => t.Cookies)
                .ThenInclude(t => t.CookieTemplate)
                .Where(t => ids.Any(p => p == t.Id))
                .ToListAsync();

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
