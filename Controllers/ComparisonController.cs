using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SmartRealEstate.Models;
using SmartRealEstate.Services;

namespace SmartRealEstate.Controllers
{
    /// <summary>
    /// API endpoints for property comparison
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ComparisonController : ControllerBase
    {
        private readonly IPropertyComparisonService _comparisonService;
        private readonly ILogger<ComparisonController> _logger;

        public ComparisonController(
            IPropertyComparisonService comparisonService,
            ILogger<ComparisonController> logger)
        {
            _comparisonService = comparisonService;
            _logger = logger;
        }

        /// <summary>
        /// Compare multiple properties
        /// </summary>
        /// <param name="request">List of property IDs to compare</param>
        /// <returns>Detailed comparison metrics</returns>
        [HttpPost("compare")]
        public async Task<ActionResult<ComparisonResponse>> CompareProperties([FromBody] ComparisonRequest request)
        {
            if (request?.PropertyIds == null || request.PropertyIds.Count < 2)
            {
                return BadRequest(new ComparisonResponse
                {
                    Success = false,
                    Error = "At least 2 property IDs are required for comparison"
                });
            }

            try
            {
                _logger.LogInformation($"Comparing {request.PropertyIds.Count} properties");
                var metrics = await _comparisonService.ComparePropertiesAsync(request.PropertyIds);

                return Ok(new ComparisonResponse
                {
                    Success = true,
                    Data = metrics,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error comparing properties: {ex.Message}");
                return StatusCode(500, new ComparisonResponse
                {
                    Success = false,
                    Error = "Error comparing properties. Please try again.",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// Get price comparison for properties
        /// </summary>
        [HttpPost("price-analysis")]
        public async Task<ActionResult<PriceComparisonResponse>> AnalyzePrices([FromBody] PropertiesRequest request)
        {
            if (request?.Properties == null || request.Properties.Count < 2)
            {
                return BadRequest("At least 2 properties are required");
            }

            try
            {
                _logger.LogInformation($"Analyzing prices for {request.Properties.Count} properties");
                var priceComparison = await _comparisonService.ComparePricesAsync(request.Properties);

                return Ok(new PriceComparisonResponse
                {
                    Success = true,
                    Data = priceComparison,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error analyzing prices: {ex.Message}");
                return StatusCode(500, new PriceComparisonResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get size comparison for properties
        /// </summary>
        [HttpPost("size-analysis")]
        public async Task<ActionResult<SizeComparisonResponse>> AnalyzeSizes([FromBody] PropertiesRequest request)
        {
            if (request?.Properties == null || request.Properties.Count < 2)
            {
                return BadRequest("At least 2 properties are required");
            }

            try
            {
                _logger.LogInformation($"Analyzing sizes for {request.Properties.Count} properties");
                var sizeComparison = await _comparisonService.CompareSizesAsync(request.Properties);

                return Ok(new SizeComparisonResponse
                {
                    Success = true,
                    Data = sizeComparison,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error analyzing sizes: {ex.Message}");
                return StatusCode(500, new SizeComparisonResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get amenities comparison for properties
        /// </summary>
        [HttpPost("amenities-analysis")]
        public async Task<ActionResult<AmenitiesComparisonResponse>> AnalyzeAmenities([FromBody] PropertiesRequest request)
        {
            if (request?.Properties == null || request.Properties.Count < 2)
            {
                return BadRequest("At least 2 properties are required");
            }

            try
            {
                _logger.LogInformation($"Analyzing amenities for {request.Properties.Count} properties");
                var amenitiesComparison = await _comparisonService.CompareAmenitiesAsync(request.Properties);

                return Ok(new AmenitiesComparisonResponse
                {
                    Success = true,
                    Data = amenitiesComparison,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error analyzing amenities: {ex.Message}");
                return StatusCode(500, new AmenitiesComparisonResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get location comparison for properties
        /// </summary>
        [HttpPost("location-analysis")]
        public async Task<ActionResult<LocationComparisonResponse>> AnalyzeLocations([FromBody] PropertiesRequest request)
        {
            if (request?.Properties == null || request.Properties.Count < 2)
            {
                return BadRequest("At least 2 properties are required");
            }

            try
            {
                _logger.LogInformation($"Analyzing locations for {request.Properties.Count} properties");
                var locationComparison = await _comparisonService.CompareLocationsAsync(request.Properties);

                return Ok(new LocationComparisonResponse
                {
                    Success = true,
                    Data = locationComparison,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error analyzing locations: {ex.Message}");
                return StatusCode(500, new LocationComparisonResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get overall scores for properties
        /// </summary>
        [HttpPost("overall-scores")]
        public async Task<ActionResult<OverallScoresResponse>> GetOverallScores([FromBody] ComparisonMetricsRequest request)
        {
            if (request?.Metrics == null)
            {
                return BadRequest("Comparison metrics are required");
            }

            try
            {
                _logger.LogInformation("Calculating overall scores");
                var overallScore = await _comparisonService.CalculateOverallScoresAsync(request.Metrics);

                return Ok(new OverallScoresResponse
                {
                    Success = true,
                    Data = overallScore,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error calculating scores: {ex.Message}");
                return StatusCode(500, new OverallScoresResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }
    }

    // Request/Response Models
    public class ComparisonRequest
    {
        public List<int> PropertyIds { get; set; }
    }

    public class PropertiesRequest
    {
        public List<Property> Properties { get; set; }
    }

    public class ComparisonMetricsRequest
    {
        public ComparisonMetrics Metrics { get; set; }
    }

    public class ComparisonResponse
    {
        public bool Success { get; set; }
        public ComparisonMetrics Data { get; set; }
        public string Error { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class PriceComparisonResponse
    {
        public bool Success { get; set; }
        public PriceComparison Data { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class SizeComparisonResponse
    {
        public bool Success { get; set; }
        public SizeComparison Data { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class AmenitiesComparisonResponse
    {
        public bool Success { get; set; }
        public AmenitiesComparison Data { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class LocationComparisonResponse
    {
        public bool Success { get; set; }
        public LocationComparison Data { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class OverallScoresResponse
    {
        public bool Success { get; set; }
        public OverallScore Data { get; set; }
        public string Error { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
