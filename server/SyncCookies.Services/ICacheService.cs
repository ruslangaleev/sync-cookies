using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SyncCookies.Services
{
    public interface ICacheService
    {
        T Get<T>(string key);
        T Set<T>(string key, T value);
    }

    public class CacheService : ICacheService
    {
        private readonly IDistributedCache _cache;

        public CacheService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public T Get<T>(string key)
        {
            var value = _cache.GetString(key);

            if (value != null)
            {
                return JsonConvert.DeserializeObject<T>(value);
            }

            return default;
        }

        public T Set<T>(string key, T value)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1),
                SlidingExpiration = TimeSpan.FromMinutes(10)
            };

            _cache.SetString(key, JsonConvert.SerializeObject(value), options);

            return value;
        }
    }
}
