using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRealEstate.Core.Entities
{
    public class Customer
    {
        [Key]
        [ForeignKey("User")]
        public int UserId { get; set; }

        public User User { get; set; } = null!;

        [MaxLength(255)]
        public string ProfileImageUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        // Navigation properties
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
        public ICollection<RentalAgreement> RentalAgreements { get; set; } = new List<RentalAgreement>();
    }
}
