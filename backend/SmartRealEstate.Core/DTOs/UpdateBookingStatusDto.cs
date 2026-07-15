using System.ComponentModel.DataAnnotations;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.DTOs
{
    public class UpdateBookingStatusDto
    {
        [Required]
        public BookingStatus Status { get; set; }
    }
}
