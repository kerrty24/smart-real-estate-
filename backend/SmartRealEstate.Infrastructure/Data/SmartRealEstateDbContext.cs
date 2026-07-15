using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.Entities;

namespace SmartRealEstate.Infrastructure.Data
{
    public class SmartRealEstateDbContext : DbContext
    {
        public SmartRealEstateDbContext(DbContextOptions<SmartRealEstateDbContext> options)
            : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<PropertyImage> PropertyImages { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Inquiry> Inquiries { get; set; }
        public DbSet<RentalAgreement> RentalAgreements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User - Role relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // User - Customer one-to-one relationship
            modelBuilder.Entity<Customer>()
                .HasKey(c => c.UserId);

            modelBuilder.Entity<Customer>()
                .HasOne(c => c.User)
                .WithOne(u => u.CustomerProfile)
                .HasForeignKey<Customer>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Property - Owner relationship
            modelBuilder.Entity<Property>()
                .HasOne(p => p.Owner)
                .WithMany(u => u.OwnedProperties)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Property - Images relationship
            modelBuilder.Entity<Property>()
                .HasMany(p => p.Images)
                .WithOne(pi => pi.Property)
                .HasForeignKey(pi => pi.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Booking relations
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany(c => c.Bookings)
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Property)
                .WithMany(p => p.Bookings)
                .HasForeignKey(b => b.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Payment relations
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Customer)
                .WithMany(c => c.Payments)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId)
                .OnDelete(DeleteBehavior.SetNull);

            // Review relations
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Customer)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Wishlist relations
            modelBuilder.Entity<Wishlist>()
                .HasOne(w => w.Customer)
                .WithMany(c => c.Wishlists)
                .HasForeignKey(w => w.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Wishlist>()
                .HasOne(w => w.Property)
                .WithMany(p => p.Wishlists)
                .HasForeignKey(w => w.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Notification relations
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Inquiry relations
            modelBuilder.Entity<Inquiry>()
                .HasOne(i => i.Customer)
                .WithMany(c => c.Inquiries)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inquiry>()
                .HasOne(i => i.Property)
                .WithMany(p => p.Inquiries)
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // RentalAgreement relations
            modelBuilder.Entity<RentalAgreement>()
                .HasOne(ra => ra.Customer)
                .WithMany(c => c.RentalAgreements)
                .HasForeignKey(ra => ra.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RentalAgreement>()
                .HasOne(ra => ra.Property)
                .WithMany(p => p.RentalAgreements)
                .HasForeignKey(ra => ra.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed default Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "Agent" },
                new Role { Id = 3, Name = "Customer" }
            );
        }
    }
}
