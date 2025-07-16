using System.Linq.Expressions;
using System.Linq;
using Entities;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore;

namespace Repository
{
    public abstract class RepositoryBase<T>(RepositoryContext repositoryContext) where T : class
    {
        protected RepositoryContext RepositoryContext = repositoryContext;

        public IQueryable<T> Find(bool trackChanges, Expression<Func<T, bool>>? expression = null, Func<IQueryable<T>, IIncludableQueryable<T, object?>>? includes = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            var queryable = RepositoryContext.Set<T>().AsQueryable<T>();

            if (includes != null)
                queryable = includes(queryable);

            if (expression != null)
                queryable = queryable.Where(expression);

            if (orderBy != null)
            {
                queryable = orderBy(queryable);
            }

            if (trackChanges == false)
                queryable = queryable.AsNoTracking();


            return queryable;
        }

        public void Create(T entity) => RepositoryContext.Set<T>().Add(entity);

        public void Update(T entity) => RepositoryContext.Set<T>().Update(entity);

        public void Delete(T entity) => RepositoryContext.Set<T>().Remove(entity);
    }
}
