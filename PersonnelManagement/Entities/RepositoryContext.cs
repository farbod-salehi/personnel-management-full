using Entities.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities
{
    public class RepositoryContext(DbContextOptions options) : IdentityDbContext<User>(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Add custom configurations of tables, columns, relationships, indexes and so on here 

            //modelBuilder.Entity<User>().HasOne ...
        }

        public DbSet<InitInfo> InitInfos { get; set; }

        public DbSet<Personnel> Personnel { get; set; }


        /* Use 'new' for DbSet<UserToken> to Avoids Conflicts with IdentityUserToken's Default DbSet, 
           because ASP.NET Core Identity already includes a default DbSet for it 
        */
        public new DbSet<UserToken> UserTokens { get; set; }
    }
}
