using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartRealEstate.Models
{
    /// <summary>
    /// Represents a real estate property
    /// </summary>
    public class Property
    {
        public int Id { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public decimal Price { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public double SquareFeet { get; set; }
        public int YearBuilt { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string PropertyType { get; set; } // House, Apartment, Condo, etc.
        public string Description { get; set; }
        public List<string> ImageUrls { get; set; } = new List<string>();
        public List<string> Amenities { get; set; } = new List<string>();
        public decimal PricePerSquareFoot => SquareFeet > 0 ? Price / (decimal)SquareFeet : 0;
        public DateTime ListingDate { get; set; }
        public bool IsAvailable { get; set; }
    }

    /// <summary>
    /// Comparison data for multiple properties
    /// </summary>
    public class PropertyComparison
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public List<int> PropertyIds { get; set; } = new List<int>();
        public List<Property> Properties { get; set; } = new List<Property>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Name { get; set; }
    }

    /// <summary>
    /// Comparison metrics and analysis
    /// </summary>
    public class ComparisonMetrics
    {
        public List<Property> Properties { get; set; } = new List<Property>();
        public PriceComparison PriceAnalysis { get; set; }
        public SizeComparison SizeAnalysis { get; set; }
        public AmenitiesComparison AmenitiesAnalysis { get; set; }
        public LocationComparison LocationAnalysis { get; set; }
        public OverallScore OverallScores { get; set; }
    }

    public class PriceComparison
    {
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal PriceRange { get; set; }
        public Dictionary<int, PriceMetrics> PropertyPrices { get; set; } = new Dictionary<int, PriceMetrics>();
    }

    public class PriceMetrics
    {
        public int PropertyId { get; set; }
        public decimal Price { get; set; }
        public decimal PricePerSquareFoot { get; set; }
        public decimal PriceDifferenceFromAverage { get; set; }
        public decimal PercentageDifferenceFromAverage { get; set; }
    }

    public class SizeComparison
    {
        public double MinSize { get; set; }
        public double MaxSize { get; set; }
        public double AverageSize { get; set; }
        public Dictionary<int, SizeMetrics> PropertySizes { get; set; } = new Dictionary<int, SizeMetrics>();
    }

    public class SizeMetrics
    {
        public int PropertyId { get; set; }
        public double SquareFeet { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public double BedroomsPerSquareFoot { get; set; }
    }

    public class AmenitiesComparison
    {
        public List<string> CommonAmenities { get; set; } = new List<string>();
        public List<string> UniqueAmenities { get; set; } = new List<string>();
        public Dictionary<int, int> AmenityCount { get; set; } = new Dictionary<int, int>();
        public Dictionary<string, List<int>> AmenityDistribution { get; set; } = new Dictionary<string, List<int>>();
    }

    public class LocationComparison
    {
        public double CenterLatitude { get; set; }
        public double CenterLongitude { get; set; }
        public Dictionary<int, double> DistancesFromCenter { get; set; } = new Dictionary<int, double>();
        public List<string> Cities { get; set; } = new List<string>();
        public Dictionary<string, int> PropertyCountByCity { get; set; } = new Dictionary<string, int>();
    }

    public class OverallScore
    {
        public Dictionary<int, PropertyScore> PropertyScores { get; set; } = new Dictionary<int, PropertyScore>();
        public int BestOverallPropertyId { get; set; }
    }

    public class PropertyScore
    {
        public int PropertyId { get; set; }
        public double PriceScore { get; set; } // 0-100 (higher is better value)
        public double SizeScore { get; set; } // 0-100
        public double AmenityScore { get; set; } // 0-100
        public double LocationScore { get; set; } // 0-100
        public double OverallScore { get; set; } // Weighted average
    }
}
