using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartRealEstate.Models;

namespace SmartRealEstate.Services
{
    /// <summary>
    /// Service for comparing properties
    /// </summary>
    public interface IPropertyComparisonService
    {
        Task<ComparisonMetrics> ComparePropertiesAsync(List<int> propertyIds);
        Task<PriceComparison> ComparePricesAsync(List<Property> properties);
        Task<SizeComparison> CompareSizesAsync(List<Property> properties);
        Task<AmenitiesComparison> CompareAmenitiesAsync(List<Property> properties);
        Task<LocationComparison> CompareLocationsAsync(List<Property> properties);
        Task<OverallScore> CalculateOverallScoresAsync(ComparisonMetrics metrics);
    }

    public class PropertyComparisonService : IPropertyComparisonService
    {
        private readonly ILogger<PropertyComparisonService> _logger;
        private const double EarthRadiusKm = 6371;

        public PropertyComparisonService(ILogger<PropertyComparisonService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Compare multiple properties and generate comprehensive metrics
        /// </summary>
        public async Task<ComparisonMetrics> ComparePropertiesAsync(List<int> propertyIds)
        {
            try
            {
                _logger.LogInformation($"Comparing {propertyIds.Count} properties");

                if (propertyIds.Count < 2)
                {
                    throw new ArgumentException("At least 2 properties are required for comparison");
                }

                // TODO: Fetch properties from database
                var properties = new List<Property>(); // Replace with actual DB call

                var metrics = new ComparisonMetrics
                {
                    Properties = properties,
                    PriceAnalysis = await ComparePricesAsync(properties),
                    SizeAnalysis = await CompareSizesAsync(properties),
                    AmenitiesAnalysis = await CompareAmenitiesAsync(properties),
                    LocationAnalysis = await CompareLocationsAsync(properties)
                };

                metrics.OverallScores = await CalculateOverallScoresAsync(metrics);

                _logger.LogInformation("Properties compared successfully");
                return metrics;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error comparing properties: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Compare prices across properties
        /// </summary>
        public async Task<PriceComparison> ComparePricesAsync(List<Property> properties)
        {
            return await Task.Run(() =>
            {
                var comparison = new PriceComparison();
                comparison.PropertyPrices = new Dictionary<int, PriceMetrics>();

                if (properties.Count == 0)
                    return comparison;

                var prices = properties.Select(p => p.Price).ToList();
                comparison.MinPrice = prices.Min();
                comparison.MaxPrice = prices.Max();
                comparison.PriceRange = comparison.MaxPrice - comparison.MinPrice;
                comparison.AveragePrice = prices.Average();

                foreach (var property in properties)
                {
                    comparison.PropertyPrices[property.Id] = new PriceMetrics
                    {
                        PropertyId = property.Id,
                        Price = property.Price,
                        PricePerSquareFoot = property.PricePerSquareFoot,
                        PriceDifferenceFromAverage = property.Price - comparison.AveragePrice,
                        PercentageDifferenceFromAverage = ((property.Price - comparison.AveragePrice) / comparison.AveragePrice * 100)
                    };
                }

                return comparison;
            });
        }

        /// <summary>
        /// Compare sizes and features across properties
        /// </summary>
        public async Task<SizeComparison> CompareSizesAsync(List<Property> properties)
        {
            return await Task.Run(() =>
            {
                var comparison = new SizeComparison();
                comparison.PropertySizes = new Dictionary<int, SizeMetrics>();

                if (properties.Count == 0)
                    return comparison;

                var sizes = properties.Select(p => p.SquareFeet).ToList();
                comparison.MinSize = sizes.Min();
                comparison.MaxSize = sizes.Max();
                comparison.AverageSize = sizes.Average();

                foreach (var property in properties)
                {
                    comparison.PropertySizes[property.Id] = new SizeMetrics
                    {
                        PropertyId = property.Id,
                        SquareFeet = property.SquareFeet,
                        Bedrooms = property.Bedrooms,
                        Bathrooms = property.Bathrooms,
                        BedroomsPerSquareFoot = property.Bedrooms / (property.SquareFeet > 0 ? property.SquareFeet : 1)
                    };
                }

                return comparison;
            });
        }

        /// <summary>
        /// Compare amenities across properties
        /// </summary>
        public async Task<AmenitiesComparison> CompareAmenitiesAsync(List<Property> properties)
        {
            return await Task.Run(() =>
            {
                var comparison = new AmenitiesComparison();

                if (properties.Count == 0)
                    return comparison;

                // Find common amenities
                var allAmenities = properties.SelectMany(p => p.Amenities).Distinct().ToList();
                comparison.CommonAmenities = allAmenities
                    .Where(a => properties.All(p => p.Amenities.Contains(a)))
                    .ToList();

                comparison.UniqueAmenities = allAmenities
                    .Where(a => !comparison.CommonAmenities.Contains(a))
                    .ToList();

                // Count amenities per property
                foreach (var property in properties)
                {
                    comparison.AmenityCount[property.Id] = property.Amenities.Count;
                }

                // Distribution of each amenity
                foreach (var amenity in allAmenities)
                {
                    comparison.AmenityDistribution[amenity] = properties
                        .Where(p => p.Amenities.Contains(amenity))
                        .Select(p => p.Id)
                        .ToList();
                }

                return comparison;
            });
        }

        /// <summary>
        /// Compare locations and calculate distances
        /// </summary>
        public async Task<LocationComparison> CompareLocationsAsync(List<Property> properties)
        {
            return await Task.Run(() =>
            {
                var comparison = new LocationComparison();

                if (properties.Count == 0)
                    return comparison;

                // Calculate center point
                comparison.CenterLatitude = properties.Average(p => p.Latitude);
                comparison.CenterLongitude = properties.Average(p => p.Longitude);

                // Calculate distances from center
                foreach (var property in properties)
                {
                    comparison.DistancesFromCenter[property.Id] = CalculateDistance(
                        comparison.CenterLatitude,
                        comparison.CenterLongitude,
                        property.Latitude,
                        property.Longitude
                    );
                }

                // Group by city
                comparison.Cities = properties.Select(p => p.City).Distinct().ToList();
                foreach (var city in comparison.Cities)
                {
                    comparison.PropertyCountByCity[city] = properties.Count(p => p.City == city);
                }

                return comparison;
            });
        }

        /// <summary>
        /// Calculate overall scores for each property
        /// </summary>
        public async Task<OverallScore> CalculateOverallScoresAsync(ComparisonMetrics metrics)
        {
            return await Task.Run(() =>
            {
                var overallScore = new OverallScore();
                overallScore.PropertyScores = new Dictionary<int, PropertyScore>();

                if (metrics.Properties.Count == 0)
                    return overallScore;

                foreach (var property in metrics.Properties)
                {
                    var score = new PropertyScore
                    {
                        PropertyId = property.Id,
                        PriceScore = CalculatePriceScore(metrics.PriceAnalysis, property.Id),
                        SizeScore = CalculateSizeScore(metrics.SizeAnalysis, property.Id),
                        AmenityScore = CalculateAmenityScore(metrics.AmenitiesAnalysis, property.Id),
                        LocationScore = CalculateLocationScore(metrics.LocationAnalysis, property.Id)
                    };

                    // Weighted average (adjust weights as needed)
                    score.OverallScore = (score.PriceScore * 0.25) +
                                        (score.SizeScore * 0.25) +
                                        (score.AmenityScore * 0.25) +
                                        (score.LocationScore * 0.25);

                    overallScore.PropertyScores[property.Id] = score;
                }

                // Find best property
                overallScore.BestOverallPropertyId = overallScore.PropertyScores
                    .OrderByDescending(x => x.Value.OverallScore)
                    .First()
                    .Key;

                return overallScore;
            });
        }

        // Helper Methods

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return EarthRadiusKm * c;
        }

        private double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        private double CalculatePriceScore(PriceComparison priceAnalysis, int propertyId)
        {
            if (!priceAnalysis.PropertyPrices.ContainsKey(propertyId))
                return 0;

            var metrics = priceAnalysis.PropertyPrices[propertyId];
            // Lower price = higher score (inverted scale)
            return 100 - Math.Min(((metrics.Price - priceAnalysis.MinPrice) / (priceAnalysis.PriceRange + 1)) * 100, 100);
        }

        private double CalculateSizeScore(SizeComparison sizeAnalysis, int propertyId)
        {
            if (!sizeAnalysis.PropertySizes.ContainsKey(propertyId))
                return 0;

            var metrics = sizeAnalysis.PropertySizes[propertyId];
            var sizeRange = sizeAnalysis.MaxSize - sizeAnalysis.MinSize;
            // Higher size = higher score
            return Math.Min(((metrics.SquareFeet - sizeAnalysis.MinSize) / (sizeRange + 1)) * 100, 100);
        }

        private double CalculateAmenityScore(AmenitiesComparison amenitiesAnalysis, int propertyId)
        {
            if (!amenitiesAnalysis.AmenityCount.ContainsKey(propertyId))
                return 0;

            var count = amenitiesAnalysis.AmenityCount[propertyId];
            var maxAmenities = amenitiesAnalysis.AmenityCount.Values.Max();
            return (count / (double)maxAmenities) * 100;
        }

        private double CalculateLocationScore(LocationComparison locationAnalysis, int propertyId)
        {
            if (!locationAnalysis.DistancesFromCenter.ContainsKey(propertyId))
                return 0;

            var distance = locationAnalysis.DistancesFromCenter[propertyId];
            var maxDistance = locationAnalysis.DistancesFromCenter.Values.Max();
            // Closer to center = higher score
            return 100 - ((distance / (maxDistance + 1)) * 100);
        }
    }
}
