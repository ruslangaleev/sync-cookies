using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SyncCookies.Services.Hubs
{
    public class CookieHub : Hub
    {
        private readonly static ConnectionMapping<string> _connections = 
            new ConnectionMapping<string>();

        public override Task OnConnectedAsync()
        {
            var connectionId = Context.ConnectionId;
            var name = Context.User.Identity.Name;

            //_connections.Add(name, connectionId);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var connectionId = Context.ConnectionId;
            var name = Context.User.Identity.Name;

            //_connections.Remove(name, connectionId);

            return base.OnDisconnectedAsync(exception);
        }
    }
}
