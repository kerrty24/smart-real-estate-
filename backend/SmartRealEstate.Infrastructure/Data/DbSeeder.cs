using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.Entities;
using SmartRealEstate.Core.Interfaces;
using System.Threading.Tasks;

namespace SmartRealEstate.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminUserAsync(SmartRealEstateDbContext dbContext, IPasswordHasher passwordHasher)
        {
            var adminRole = await dbContext.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (adminRole == null) return;

            var adminUserExists = await dbContext.Users.AnyAsync(u => u.RoleId == adminRole.Id);
            if (!adminUserExists)
            {
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@smartrealestate.com",
                    PasswordHash = passwordHasher.HashPassword("Admin@123"),
                    FirstName = "System",
                    LastName = "Administrator",
                    PhoneNumber = "1234567890",
                    RoleId = adminRole.Id
                };

                dbContext.Users.Add(adminUser);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
