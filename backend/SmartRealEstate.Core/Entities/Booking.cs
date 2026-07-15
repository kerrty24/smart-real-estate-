using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.Entities
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        public int PropertyId { get; set; }

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;

        [Required]
        public DateTime VisitDate { get; set; }

        [Required]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for potential payment linked to this booking
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
