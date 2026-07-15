using System.Threading.Tasks;

namespace SmartRealEstate.Core.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GenerateReportPdfAsync(string reportTitle, string content);
    }
}
