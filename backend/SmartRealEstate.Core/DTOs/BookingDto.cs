using System;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
