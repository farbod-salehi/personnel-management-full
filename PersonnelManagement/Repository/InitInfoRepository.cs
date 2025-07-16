using Entities;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository
{
    public class InitInfoRepository(RepositoryContext repositoryContext) : RepositoryBase<InitInfo>(repositoryContext)
    {
        public async Task<(List<InitInfo> list, int count)> GetList(bool trackChanges, int page, int count, string? searchQuery = null, Guid? parentId = null)
        {
            var queryable = Find(trackChanges,
                x => ((parentId == null && x.ParentId == null) || (parentId != null && x.ParentId == parentId)) &&
                (string.IsNullOrWhiteSpace(searchQuery) || x.Title.Contains(searchQuery)) &&
                x.DeletedAt == null,
                null,
                x => x.OrderByDescending(y => y.CreatedAt));

            var itemsCount = queryable.Count();

            var pagesCount = Convert.ToInt32(Math.Ceiling((double)itemsCount / count));
            

            return (await queryable.Skip((page - 1) * count).Take(count).ToListAsync(), pagesCount);

        }

        public Task<List<InitInfo>> GetAll(bool trackchanges, int? type = null)
        {
            return Find(trackchanges, x => (type == null || x.Type.Equals(type)) && x.DeletedAt == null, null, x => x.OrderBy(y => y.Title)).ToListAsync();
        }

        public Task<InitInfo?> GetById(bool trackchanges, int type, Guid id)
        {
            return Find(trackchanges, x=>x.Type.Equals(type) && x.Id.Equals(id) && x.DeletedAt == null).FirstOrDefaultAsync();
        }
    }
}
