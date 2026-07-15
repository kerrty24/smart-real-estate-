using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartRealEstate.Core.Interfaces
{
    public interface IAiService
    {
        Task<string> GeneratePropertyDescriptionAsync(string title, string propertyType, int bedrooms, int bathrooms, string amenities, string location);
        Task<List<int>> GetRecommendedPropertyIdsAsync(int userId, string userPreferences);
        Task<string> ChatAssistantAsync(string userMessage);
    }
}
