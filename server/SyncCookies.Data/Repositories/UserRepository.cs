using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SyncCookies.Models;

namespace SyncCookies.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetAsync(Guid userId);
        Task<User> GetAsync(string email);
        Task<List<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> RemoveAsync(Guid userId);
    }

    public class UserRepository : IUserRepository
    {
        private readonly ApplicationContext _context;

        public UserRepository(ApplicationContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user)
        {
            user.CreateAt = DateTime.UtcNow;
            user.UpdateAt = DateTime.UtcNow;

            await _context.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> GetAsync(Guid userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        //public async Task<User> GetByUserNameAsync(string userName)
        //{
        //    return await _context.Users.FirstOrDefaultAsync(t => t.UserName == userName);
        //}

        public async Task UpdateAsync(User user)
        {
            _context.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RemoveAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if(user == null)
            {
                return false;
            }

            _context.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<User> GetAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(t => t.Email == email);
        }
    }
}
