using Entities;
using Entities.Models;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class UserTokenRepository(RepositoryContext repositoryContext) : RepositoryBase<UserToken>(repositoryContext)
    {
        public async Task<UserToken?> GetByToken(bool trackChanges, string hashedToken, Func<IQueryable<UserToken>, IIncludableQueryable<UserToken, object?>>? includes = null)
        {
            var queryable = Find(trackChanges, x => x.HashedToken.Equals(hashedToken));

            if (includes != null)
            {
                queryable = includes(queryable);
            }

            return await queryable.SingleOrDefaultAsync();

        }
    }
}
