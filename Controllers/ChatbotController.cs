using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SmartRealEstate.Services;

namespace SmartRealEstate.Controllers
{
    /// <summary>
    /// API endpoints for Gemini-powered property chatbot
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IGeminiChatbotService _chatbotService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(
            IGeminiChatbotService chatbotService,
            ILogger<ChatbotController> logger)
        {
            _chatbotService = chatbotService;
            _logger = logger;
        }

        /// <summary>
        /// Process a property inquiry message
        /// </summary>
        /// <param name="request">User query for property search</param>
        /// <returns>AI-generated response with property recommendations</returns>
        [HttpPost("inquiry")]
        public async Task<ActionResult<ChatbotResponse>> ProcessInquiry([FromBody] ChatbotRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Message))
            {
                return BadRequest("Message cannot be empty");
            }

            try
            {
                _logger.LogInformation($"Processing inquiry: {request.Message}");
                var response = await _chatbotService.ProcessPropertyInquiryAsync(request.Message);

                return Ok(new ChatbotResponse
                {
                    Success = true,
                    Message = response,
                    Timestamp = System.DateTime.UtcNow
                });
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Error processing inquiry: {ex.Message}");
                return StatusCode(500, new ChatbotResponse
                {
                    Success = false,
                    Message = "Error processing your inquiry. Please try again.",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Generate a professional property listing description
        /// </summary>
        /// <param name="request">Property features</param>
        /// <returns>Generated listing description</returns>
        [HttpPost("generate-description")]
        public async Task<ActionResult<ChatbotResponse>> GenerateDescription([FromBody] DescriptionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Features))
            {
                return BadRequest("Features cannot be empty");
            }

            try
            {
                _logger.LogInformation("Generating property description");
                var description = await _chatbotService.GeneratePropertyDescriptionAsync(request.Features);

                return Ok(new ChatbotResponse
                {
                    Success = true,
                    Message = description,
                    Timestamp = System.DateTime.UtcNow
                });
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Error generating description: {ex.Message}");
                return StatusCode(500, new ChatbotResponse
                {
                    Success = false,
                    Message = "Error generating description. Please try again.",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Analyze a property image and extract features
        /// </summary>
        /// <param name="request">Base64 encoded property image</param>
        /// <returns>Extracted property features</returns>
        [HttpPost("analyze-image")]
        public async Task<ActionResult<ImageAnalysisResponse>> AnalyzeImage([FromBody] ImageAnalysisRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.ImageBase64))
            {
                return BadRequest("Image data cannot be empty");
            }

            try
            {
                _logger.LogInformation("Analyzing property image");
                var features = await _chatbotService.AnalyzePropertyImageAsync(request.ImageBase64);

                return Ok(new ImageAnalysisResponse
                {
                    Success = true,
                    Features = features,
                    Timestamp = System.DateTime.UtcNow
                });
            }
            catch (System.Exception ex)
            {
                _logger.LogError($"Error analyzing image: {ex.Message}");
                return StatusCode(500, new ImageAnalysisResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }
    }

    // Request/Response Models
    public class ChatbotRequest
    {
        public string Message { get; set; }
    }

    public class DescriptionRequest
    {
        public string Features { get; set; }
    }

    public class ImageAnalysisRequest
    {
        public string ImageBase64 { get; set; }
    }

    public class ChatbotResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
        public System.DateTime Timestamp { get; set; }
    }

    public class ImageAnalysisResponse
    {
        public bool Success { get; set; }
        public List<string> Features { get; set; }
        public string Error { get; set; }
        public System.DateTime Timestamp { get; set; }
    }
}
