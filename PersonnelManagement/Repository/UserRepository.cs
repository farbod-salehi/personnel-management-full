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
        public async Task<(List<User> list, int count)> GetList(bool trackChanges, int? excludeRole = null, string? query = null, int page = 1, int count = 10)
        {
            var queryable = Find(trackChanges,
                x => (query == null || x.Title.Contains(query) || x.UserName!.Contains(query)) && (excludeRole == null || x.Role != excludeRole),
                null,
                x => x.OrderByDescending(y => y.CreatedAt));

            var itemsCount = queryable.Count();

            var pagesCount = Convert.ToInt32(Math.Ceiling((double)itemsCount / count));

            return (await queryable.Skip((page - 1) * count).Take(count).ToListAsync(), pagesCount);

        }

        public async Task<User?> GetById(bool trackChanges, string id, int? excludeRole = null)
        {
            return await Find(trackChanges, x => x.Id.Equals(id) && (excludeRole == null || x.Role != excludeRole)).FirstOrDefaultAsync();
        }
    }
}
