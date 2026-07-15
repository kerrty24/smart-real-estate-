using System.IO;
using System.Threading.Tasks;

namespace SmartRealEstate.Core.Interfaces
{
    public interface IImageStorageService
    {
        Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType);
        Task DeleteImageAsync(string imageUrl);
    }
}
