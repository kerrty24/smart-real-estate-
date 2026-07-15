using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.Entities
{
    public class Property
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "TEXT")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string PropertyType { get; set; } = string.Empty; // Apartment, House, etc.

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }

        [Required]
        public double Area { get; set; } // in sq ft / sq meters

        [Required]
        public int Bedrooms { get; set; }

        [Required]
        public int Bathrooms { get; set; }

        public bool Parking { get; set; }

        public bool Furnished { get; set; }

        [MaxLength(500)]
        public string Amenities { get; set; } = string.Empty; // Comma separated values e.g. "Pool,Gym,Elevator"

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        [Required]
        public int OwnerId { get; set; }

        [ForeignKey("OwnerId")]
        public User Owner { get; set; } = null!;

        [Required]
        public PropertyStatus Status { get; set; } = PropertyStatus.Available;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
        public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
        public ICollection<RentalAgreement> RentalAgreements { get; set; } = new List<RentalAgreement>();
    }
}
