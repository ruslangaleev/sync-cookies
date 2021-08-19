using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface ICookieTemplateRepository
    {
        Task<Page<CookieTemplate>> GetByResourceAsync(Guid resourceId);

        Task<CookieTemplate> GetByTemplateAsync(Guid templateId);

        Task CreateAsync(CookieTemplate cookieTemplate);

        void Update(CookieTemplate cookieTemplate);

        void Remove(CookieTemplate cookieTemplate);

        Task SaveChangesAsync();
    }

    public class CookieTemplateRepository : ICookieTemplateRepository
    {
        private readonly ApplicationContext _context;

        public CookieTemplateRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(CookieTemplate cookieTemplate)
        {
            await _context.CookieTemplates.AddAsync(cookieTemplate);
        }

        public async Task<Page<CookieTemplate>> GetByResourceAsync(Guid resourceId)
        {
            var templates = await _context.CookieTemplates.Where(t => t.ResourceId == resourceId).ToListAsync();

            return new Page<CookieTemplate>
            {
                Data = templates,
                PageCount = 1000,
                PageNumber = 1,
                TotalCount = templates.Count
            };
        }

        public async Task<CookieTemplate> GetByTemplateAsync(Guid templateId)
        {
            return await _context.CookieTemplates.FindAsync(templateId);
        }

        public void Remove(CookieTemplate cookieTemplate)
        {
            _context.CookieTemplates.Remove(cookieTemplate);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Update(CookieTemplate cookieTemplate)
        {
            _context.CookieTemplates.Update(cookieTemplate);
        }
    }
}
