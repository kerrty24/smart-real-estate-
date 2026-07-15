using System.ComponentModel.DataAnnotations;

namespace SmartRealEstate.Core.DTOs
{
    public class PropertyCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string PropertyType { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, double.MaxValue)]
        public double Area { get; set; }

        [Required]
        [Range(0, 50)]
        public int Bedrooms { get; set; }

        [Required]
        [Range(0, 50)]
        public int Bathrooms { get; set; }

        public bool Parking { get; set; }
        public bool Furnished { get; set; }

        [MaxLength(500)]
        public string Amenities { get; set; } = string.Empty;

        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
