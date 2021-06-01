using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface IResourceRepository
    {
        Task<Page<Resource>> GetAsync();

        Task<Resource> GetAsync(Guid resourceId, bool include = false);

        Task CreateAsync(Resource resource);

        void Update(Resource resource);

        Task RemoveAsync(Resource resource);

        // TODO: Удалить отсюда
        Task SaveChangesAsync();
    }

    public class ResourceRepository : IResourceRepository
    {
        private readonly ApplicationContext _context;

        public ResourceRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(Resource resourceInfo)
        {
            await _context.Resources.AddAsync(resourceInfo);
        }

        public async Task<Page<Resource>> GetAsync()
        {
            var resources = await _context.Resources.ToListAsync();
            return new Page<Resource>
            {
                Data = resources,
                PageCount = 1000,
                PageNumber = 1,
                TotalCount = resources.Count
            };
        }

        public async Task<Resource> GetAsync(Guid resourceId, bool include = false)
        {
            if (include)
            {
                return await _context.Resources.Include(t => t.CookieTemplates).Include(t => t.Clients).SingleOrDefaultAsync(t => t.Id == resourceId);
            }
            else
            {
                return await _context.Resources.FindAsync(resourceId);
            }
        }

        public async Task RemoveAsync(Resource resource)
        {
            _context.Resources.Remove(resource);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Update(Resource resourceInfo)
        {
            _context.Resources.Update(resourceInfo);
        }
    }
}
