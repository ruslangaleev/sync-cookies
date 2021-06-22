using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface ICookieRepository
    {
        Task<Cookie> GetByCookieIdAsync(Guid cookieId);

        Task<Page<Cookie>> GetByClientIdAsync(Guid clientId);

        void UpdateCookie(Cookie actualCookie);

        Task CreateCookieAsync(Cookie cookies);

        Task CreateRangeCookieAsync(Cookie[] cookies);

        void Remove(Cookie cookie);

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

        public async Task CreateRangeCookieAsync(Cookie[] cookies)
        {
            await _context.ActualCookies.AddRangeAsync(cookies);
        }

        public async Task<Page<Cookie>> GetByClientIdAsync(Guid clientId)
        {
            var cookies = await _context.ActualCookies.Where(t => t.ClientId == clientId).ToListAsync();

            return new Page<Cookie>
            {
                Data = cookies,
                PageCount = 1000,
                PageNumber = 1,
                TotalCount = cookies.Count
            };
        }

        public async Task<Cookie> GetByCookieIdAsync(Guid cookieId)
        {
            return await _context.ActualCookies.FindAsync(cookieId);
        }

        public void Remove(Cookie cookie)
        {
            _context.ActualCookies.Remove(cookie);
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
