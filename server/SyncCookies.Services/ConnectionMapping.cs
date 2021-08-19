using System.Collections.Generic;
using System.Linq;

namespace SyncCookies.Services
{
    public interface IConnectionMapping<T>
    {
        int Count { get; }

        void Add(T key, string connectionId);

        IEnumerable<string> GetConnectionsByKey(T key);

        IEnumerable<string> GetConnectionsByKeys(IEnumerable<T> keys);

        void Remove(T key, string connectionId);
    }

    public class ConnectionMapping<T> : IConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections = new Dictionary<T, HashSet<string>>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnectionsByKeys(IEnumerable<T> keys)
        {
            var conns = new List<string>();
            foreach (var key in keys)
            {
                HashSet<string> connections = null;
                if (_connections.TryGetValue(key, out connections))
                {
                    conns.Add(connections.SingleOrDefault());
                }
            }

            return conns;
        }

        public IEnumerable<string> GetConnectionsByKey(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }
}
