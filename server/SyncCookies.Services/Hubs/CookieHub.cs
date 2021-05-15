using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using SyncCookies.Data.Repositories;

namespace SyncCookies.Services.Hubs
{
    public class CookieHub : Hub
    {
        //private readonly static ConnectionMapping<string> _connections = 
        //    new ConnectionMapping<string>();

        private readonly IConnectionMapping<string> _connectionMapping;
        private readonly UserRepository _userRepo;

        public CookieHub(IConnectionMapping<string> connectionMapping, UserRepository userRepo)
        {
            _connectionMapping = connectionMapping;
            _userRepo = userRepo;
        }

        public override Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            var email = Context.User.Identity.Name;

            _connectionMapping.Add(email, connectionId);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var connectionId = Context.ConnectionId;
            var email = Context.User.Identity.Name;

            _connectionMapping.Remove(email, connectionId);

            return base.OnDisconnectedAsync(exception);
        }
    }
}
