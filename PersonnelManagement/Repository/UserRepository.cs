using Entities;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class UserRepository(RepositoryContext repositoryContext) : RepositoryBase<User>(repositoryContext)
    {
        public async Task<User?> GetById(bool trackChanges, string id, int? excludeRole = null)
        {
            return await Find(trackChanges, x => x.Id.Equals(id) && (excludeRole == null || x.Role != excludeRole)).FirstOrDefaultAsync();
        }
    }
}
