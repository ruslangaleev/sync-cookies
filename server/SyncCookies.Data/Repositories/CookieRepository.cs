﻿using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface ICookieRepository
    {
        Task<ResourceCookie> GetResourceCookieAsync(string url);

        Task<ActualCookie> GetActualCookieAsync(string url, string name);

        void UpdateActualCookie(ActualCookie actualCookie);

        Task CreateActualCookieAsync(ActualCookie actualCookie);

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

        public async Task CreateActualCookieAsync(ActualCookie actualCookie)
        {
            await _context.AddAsync(actualCookie);
        }

        public async Task<ActualCookie> GetActualCookieAsync(string url, string name)
        {
            return await _context.ActualCookies
                .Include(t=> t.ResourceCookie)
                .SingleOrDefaultAsync(t => t.ResourceCookie.Url == url && t.Name == name);
        }

        public async Task<ResourceCookie> GetResourceCookieAsync(string url)
        {
            return await _context.ResourceCookies.SingleOrDefaultAsync(t => t.Url == url);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void UpdateActualCookie(ActualCookie actualCookie)
        {
            _context.Update(actualCookie);
        }
    }
}
