using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SyncCookies.Services.Auth;

namespace SyncCookies.Services
{
    public static class TokenGenerator
    {
        public static string GenerateTokenForUser(string email)
        {
            var now = DateTime.UtcNow;
            var shelfLife = now.AddMinutes(AuthOptions.LIFETIME);
            var totalSeconds = (Int32)(shelfLife.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            var claims = new List<Claim>
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, email),
                new Claim(ClaimsIdentity.DefaultRoleClaimType, "USER"),
                new Claim("LIFETIME", totalSeconds.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);
            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                    issuer: AuthOptions.ISSUER,
                    audience: AuthOptions.AUDIENCE,
                    notBefore: now,
                    claims: claimsIdentity.Claims,
                    //expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                    
                    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            return encodedJwt;
        }

        public static string GenerateTokenForAdmin(string userName)
        {
            var now = DateTime.UtcNow;
            var shelfLife = now.AddMinutes(AuthOptions.LIFETIME);
            var totalSeconds = (Int32)(shelfLife.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            var claims = new List<Claim>
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, userName),
                new Claim(ClaimsIdentity.DefaultRoleClaimType, "ADMIN"),
                new Claim("LIFETIME", totalSeconds.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);

            // создаем JWT-токен
            var jwt = new JwtSecurityToken(
                    issuer: AuthOptions.ISSUER,
                    audience: AuthOptions.AUDIENCE,
                    notBefore: now,
                    claims: claimsIdentity.Claims,
                    //expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                    signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            return encodedJwt;
        }
    }
}
