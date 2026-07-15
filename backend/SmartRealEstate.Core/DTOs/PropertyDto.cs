using System;
using System.Collections.Generic;

namespace SmartRealEstate.Core.DTOs
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public double Area { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public bool Parking { get; set; }
        public bool Furnished { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public List<PropertyImageDto> Images { get; set; } = new List<PropertyImageDto>();
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public bool IsWishlisted { get; set; } // contextual based on requesting user
    }
}
