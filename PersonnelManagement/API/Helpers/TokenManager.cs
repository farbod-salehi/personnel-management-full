using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repository;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Helpers
{

    public class TokenManager
    {
        public string GenerateJWTToken(User user)
        {
            byte[] key = Encoding.UTF8.GetBytes(Constances.JWTSettings.Key);

            SymmetricSecurityKey secret = new(key);

            SigningCredentials signingCredentials = new(secret, SecurityAlgorithms.HmacSha256);

            List<Claim> claims = [new(ClaimTypes.NameIdentifier, user.Id)];

            claims.Add(new(ClaimTypes.Role, Convert.ToString(user.Role)));

            var tokenOptions = new JwtSecurityToken(
                    issuer: Constances.JWTSettings.Issuer,
                    audience: Constances.JWTSettings.Audience,
                    claims: claims,
                    expires: DateTime.Now.AddDays(Constances.JWTSettings.ValidDays),
                    signingCredentials: signingCredentials
                );


            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }

        public string GetJWTToken(HttpRequest httpRequest)
        {
            var token = Convert.ToString(httpRequest.Headers.Authorization);

            if (string.IsNullOrWhiteSpace(token))
            {
                return token;
            }

            return token.Replace("Bearer ", "");
        }

        public async Task<bool> JWTTokenIsValid(string token, HttpRequest httpRequest, RepositoryManager repositoryManager)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                ClaimsPrincipal claims = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = Constances.JWTSettings.Issuer,
                    ValidAudience = Constances.JWTSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constances.JWTSettings.Key))
                }, out SecurityToken securityToken);

                httpRequest.HttpContext.Items.Add("tokenClaims", claims);

            }
            catch
            {
                return false;
            }

            MyUtility utility = new();

            string hashedToken = utility.ComputeSha256Hash(token);

            var userToken = await repositoryManager.UserToken.GetByToken(false, hashedToken, includes: source => source.Include(x => x.User));

            if (userToken != null && userToken.ExpiredAt > DateTime.UtcNow)
            {
                             
                if (userToken.User?.Active ?? false)
                {
                    return true;
                }
                else
                {
                    repositoryManager.UserToken.Delete(userToken);

                    await repositoryManager.SaveAsync();

                    return false;
                }
            }

            return false;

        }
        public string? GetUserIdFromTokenClaims(HttpContext httpContext)
        {
            ClaimsPrincipal? claimsPrincipal = httpContext.Items["tokenClaims"] as ClaimsPrincipal; // tokenClaims has been added tp httpContext in JWTTokenIsValid() method

            return claimsPrincipal?.Claims?.Where(x => x.Type == ClaimTypes.NameIdentifier).Select(x => x.Value).FirstOrDefault();
        }

    }
}
