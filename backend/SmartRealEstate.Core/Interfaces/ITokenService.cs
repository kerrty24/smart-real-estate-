using System.Security.Claims;
using SmartRealEstate.Core.Entities;

namespace SmartRealEstate.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        RefreshToken GenerateRefreshToken(string ipAddress);
    }
}
