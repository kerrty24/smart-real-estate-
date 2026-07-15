using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SmartRealEstate.Infrastructure.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<SmartRealEstateDbContext>
    {
        public SmartRealEstateDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<SmartRealEstateDbContext>();
            
            // Build configuration using the appsettings.json in the Api project
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "../SmartRealEstate.Api");
            if (!Directory.Exists(basePath))
            {
                // Fallback for when running from a different root folder
                basePath = Directory.GetCurrentDirectory();
            }

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                                  ?? "Server=127.0.0.1;Port=3306;Database=smart_real_estate_db;User=root;Password=;";

            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new SmartRealEstateDbContext(optionsBuilder.Options);
        }
    }
}
