using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.Entities
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        public int? BookingId { get; set; }

        [ForeignKey("BookingId")]
        public Booking? Booking { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerId")]
        public Customer Customer { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; // UPI, Credit Card, Cash, etc.

        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
