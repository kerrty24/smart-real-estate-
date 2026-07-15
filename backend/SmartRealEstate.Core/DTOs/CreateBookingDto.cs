using System;
using System.ComponentModel.DataAnnotations;

namespace SmartRealEstate.Core.DTOs
{
    public class CreateBookingDto
    {
        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime VisitDate { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;
    }
}
