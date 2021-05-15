using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface ICookieRepository
    {
        Task<Cookie> GetAsync(Guid cookieId, bool include = false);

        void UpdateCookie(Cookie actualCookie);

        Task CreateCookieAsync(Cookie actualCookie);

        // TODO: Временно здесь
        Task SaveChangesAsync();
    }

    public class CookieRepository : ICookieRepository
    {
        private readonly ApplicationContext _context;

        public CookieRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task CreateCookieAsync(Cookie actualCookie)
        {
            await _context.AddAsync(actualCookie);
        }

        public async Task<Cookie> GetAsync(Guid cookieId, bool include = false)
        {
            if (include)
            {
                return await _context.ActualCookies.Include(t => t.CookieTemplate).Include(t => t.Client).SingleOrDefaultAsync(t => t.Id == cookieId);
            }
            else
            {
                return await _context.ActualCookies.FindAsync(cookieId);
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void UpdateCookie(Cookie actualCookie)
        {
            _context.Update(actualCookie);
        }
    }
}
