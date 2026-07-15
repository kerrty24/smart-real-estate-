using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.DTOs
{
    public class PropertyFilterDto
    {
        public string? SearchTerm { get; set; }
        public string? PropertyType { get; set; }
        public string? City { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public bool? Parking { get; set; }
        public bool? Furnished { get; set; }
        public PropertyStatus? Status { get; set; }
        
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        
        public string SortBy { get; set; } = "CreatedDate"; // Price, Area, CreatedDate
        public bool SortDescending { get; set; } = true;
    }
}
