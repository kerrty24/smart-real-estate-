using System;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.DTOs
{
    public class InquiryDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Reply { get; set; } = string.Empty;
        public InquiryStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateInquiryDto
    {
        public int PropertyId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ReplyInquiryDto
    {
        public string Reply { get; set; } = string.Empty;
    }
}
