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
    public class PersonnelRepository(RepositoryContext repositoryContext): RepositoryBase<Personnel>(repositoryContext)
    {
        public async Task<(List<Personnel> list, int count)> GetList(bool trackChanges, string? searchQuery = null, int page = 1, int count = 10, Func<IQueryable<Personnel>, IIncludableQueryable<Personnel, object?>>? includes = null)
        {
            var queryable = Find(trackChanges,
                x => 
                (string.IsNullOrWhiteSpace(searchQuery) || x.ShomarePersonneli.Contains(searchQuery) || x.FirstName.Contains(searchQuery) || x.LastName.Contains(searchQuery)) &&              
                x.DeletedAt == null,
                null,
                x => x.OrderBy(y => (y.LastName + y.FirstName)));

            var itemsCount = queryable.Count();

            var pagesCount = Convert.ToInt32(Math.Ceiling((double)itemsCount / count));

            if (includes != null)
            {
                queryable = includes(queryable);
            }

            return (await queryable.Skip((page - 1) * count).Take(count).ToListAsync(), pagesCount);

        }

        public async Task<Personnel?> GetById(bool trackChanges, Guid id)
        {
            return await Find(trackChanges, x => x.Id.Equals(id) && x.DeletedAt == null).FirstOrDefaultAsync();
        }

        public async Task<bool> DataIsDuplicate(string? shomarePersonneli, string? codeMeli, Guid? excludedId=null)
        {
            return await Find(false, x =>
                                               (excludedId == null || x.Id != excludedId) &&
                                               ((shomarePersonneli != null && x.ShomarePersonneli == shomarePersonneli) ||
                                               (codeMeli != null && x.CodeMeli == codeMeli)) &&
                                               x.DeletedAt == null).AnyAsync();
                
        }
    }
}
