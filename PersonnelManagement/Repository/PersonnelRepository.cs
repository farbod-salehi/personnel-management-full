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
                (string.IsNullOrWhiteSpace(searchQuery) || x.ShomarePersonneli.Contains(searchQuery) || (x.CodeMeli != null && x.CodeMeli.Contains(searchQuery)) || (x.FirstName + " " + x.LastName).Contains(searchQuery)) &&              
                x.DeletedAt == null,
                null,
                x => x.OrderBy(y => (y.LastName + y.FirstName)));

            var itemsCount = queryable.Count();

            var pagesCount = Convert.ToInt32(Math.Ceiling((double)itemsCount / count));

            if (includes != null)
            {
                queryable = includes(queryable);
            }

            return (await (queryable.Skip((page - 1) * count).Take(count)).ToListAsync(), pagesCount);

        }

        public async Task<List<Personnel>> GetReport(Guid? cityId, Guid? mojtameId, bool? isMale, bool? isSetad, int? noeMahalKhedmat)
        {
            return await Find(false, x =>
                    (cityId == null || x.ShahrMahalKhedmatId == cityId) && (mojtameId == null || x.MojtameGhazaiyId == mojtameId) &&
                    (isMale == null || x.IsMale == isMale) && (isSetad == null || x.IsSetad == isSetad) &&
                    (noeMahalKhedmat == null || x.NoeMahalKhedmat == noeMahalKhedmat) && x.DeletedAt == null,
               x => x.Include(y => y.EblaghDakheli).Include(y => y.MadrakTahsili).Include(y => y.MojtameGhazaiy).Include(y => y.NoeEstekhdam).
                      Include(y => y.Post).Include(y => y.ReshteShoghli).Include(y => y.ReshteTahsili).Include(y => y.ShahrMahalKhedmat),
               x => x.OrderBy(y => (y.LastName + y.FirstName))).ToListAsync();
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
