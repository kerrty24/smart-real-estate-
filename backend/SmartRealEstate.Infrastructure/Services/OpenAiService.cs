using Microsoft.Extensions.Configuration;
using SmartRealEstate.Core.Interfaces;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SmartRealEstate.Infrastructure.Services
{
    public class OpenAiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly bool _isMock;

        public OpenAiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenAiSettings:ApiKey"] ?? string.Empty;
            
            // Use mock mode if API key is not set or is the default template value
            _isMock = string.IsNullOrEmpty(_apiKey) || _apiKey == "YOUR_OPENAI_API_KEY";

            if (!_isMock)
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            }
        }

        public async Task<string> GeneratePropertyDescriptionAsync(string title, string propertyType, int bedrooms, int bathrooms, string amenities, string location)
        {
            if (_isMock)
            {
                return $"[MOCK AI] Stunning {bedrooms}-bedroom, {bathrooms}-bathroom {propertyType.ToLower()} located in the heart of {location}. Features include: {amenities}. Perfect for those seeking comfort and style.";
            }

            var prompt = $"Write an engaging real estate listing description for a {propertyType} titled '{title}'. It has {bedrooms} bedrooms, {bathrooms} bathrooms, located in {location}. Amenities include: {amenities}. Make it appealing to potential buyers or renters.";

            return await CallOpenAiAsync(prompt);
        }

        public async Task<List<int>> GetRecommendedPropertyIdsAsync(int userId, string userPreferences)
        {
            if (_isMock)
            {
                // Mock returning some random property IDs
                return new List<int> { 1, 2, 3 };
            }

            var prompt = $"Given the user preferences: '{userPreferences}', and assuming I have a database of properties, suggest a JSON array of 3 integer IDs that represent the best matches. Only return the JSON array, e.g., [1, 5, 10].";
            
            var responseText = await CallOpenAiAsync(prompt);
            
            try
            {
                var ids = JsonSerializer.Deserialize<List<int>>(responseText);
                return ids ?? new List<int>();
            }
            catch
            {
                return new List<int>();
            }
        }

        public async Task<string> ChatAssistantAsync(string userMessage)
        {
            if (_isMock)
            {
                return $"[MOCK AI Assistant] I can help you with that! You said: '{userMessage}'. (Real AI integration requires a valid OpenAI API Key).";
            }

            var prompt = $"You are a helpful real estate assistant. The user says: '{userMessage}'. Respond helpfully.";
            
            return await CallOpenAiAsync(prompt);
        }

        private async Task<string> CallOpenAiAsync(string prompt)
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful assistant." },
                    new { role = "user", content = prompt }
                },
                max_tokens = 500
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

            if (!response.IsSuccessStatusCode)
            {
                return "AI Service is currently unavailable.";
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            var result = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            return result?.Trim() ?? string.Empty;
        }
    }
}
