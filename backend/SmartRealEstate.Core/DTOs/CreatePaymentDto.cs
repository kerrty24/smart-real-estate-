using System.ComponentModel.DataAnnotations;

namespace SmartRealEstate.Core.DTOs
{
    public class CreatePaymentDto
    {
        public int? BookingId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;
    }
}
