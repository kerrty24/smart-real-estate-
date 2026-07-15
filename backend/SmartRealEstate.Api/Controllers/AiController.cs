using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRealEstate.Core.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartRealEstate.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("generate-description")]
        [Authorize(Roles = "Admin,Agent,Owner")]
        public async Task<IActionResult> GenerateDescription([FromBody] GenerateDescriptionRequest request)
        {
            if (request == null) return BadRequest();

            var description = await _aiService.GeneratePropertyDescriptionAsync(
                request.Title,
                request.PropertyType,
                request.Bedrooms,
                request.Bathrooms,
                request.Amenities,
                request.Location
            );

            return Ok(new { Description = description });
        }

        [HttpPost("recommendations")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetRecommendations([FromBody] string userPreferences)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var ids = await _aiService.GetRecommendedPropertyIdsAsync(userId, userPreferences);

            return Ok(new { RecommendedPropertyIds = ids });
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] string userMessage)
        {
            var response = await _aiService.ChatAssistantAsync(userMessage);
            return Ok(new { Message = response });
        }
    }

    public class GenerateDescriptionRequest
    {
        public string Title { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}
