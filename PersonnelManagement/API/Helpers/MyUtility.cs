using Entities.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repository;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace API.Helpers
{
    public class MyUtility
    {
       

        public async Task<UserRequestAccessResult> CheckUserAccess(HttpContext context, RepositoryManager repositoryManager, int[]? validRoles = null)
        {
            TokenManager tokenManager = new();
          
            string token = tokenManager.GetJWTToken(context.Request);

            if(string.IsNullOrWhiteSpace(token))
            {
                return new(false, "لطفا وارد حساب کاربری خود شوید.", "login", 401);             
            }

            bool tokenIsValid = await tokenManager.JWTTokenIsValid(token, context.Request, repositoryManager);

            if (tokenIsValid == false)
            {
                return new(false, "لطفا وارد حساب کاربری خود شوید.", "login", 401);              
            }

            if (validRoles != null && validRoles.Length > 0)
            {
                ClaimsPrincipal? claimsPrincipal = context.Items["tokenClaims"] as ClaimsPrincipal;  // tokenClaims has been added to httpContext in JWTTokenIsValid() method

                var roles = claimsPrincipal?.Claims?.Where(x => x.Type == ClaimTypes.Role).Select(x => x.Value).ToList();

                if (roles != null)
                {
                    var roleIsValid = roles.Any(x => validRoles.Contains(Convert.ToInt32(x)));

                    if (roleIsValid == false)
                    {
                        return new(false, "شما مجوز دسترسی به این بخش را ندارید.", "message", 403);                       
                    }
                   
                }

            }

            return new(true);
        }

        public string? CorrectArabicChars(string? data)
        {
            return data?.Replace('ي', 'ی').Replace('ك', 'ک');
        }

        public string ComputeSha256Hash(string rawData)
        {
            string saltedData = rawData + "^%$%^&*&";

            byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(saltedData));
            
            StringBuilder builder = new();

            foreach (byte b in bytes)
                builder.Append(b.ToString("x2")); // Convert to hex format

            return builder.ToString();
        }
    }
}
