using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.Interfaces;
using SmartRealEstate.Infrastructure.Data;
using System.Text;
using System.Threading.Tasks;

namespace SmartRealEstate.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Agent,Owner")]
    public class ReportController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;
        private readonly IPdfService _pdfService;

        public ReportController(SmartRealEstateDbContext context, IPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        [HttpGet("properties-pdf")]
        public async Task<IActionResult> ExportPropertiesPdf()
        {
            var properties = await _context.Properties
                .Include(p => p.Owner)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("Properties Report");
            sb.AppendLine("--------------------------------------------------");
            
            foreach (var p in properties)
            {
                sb.AppendLine($"ID: {p.Id} | Title: {p.Title} | Type: {p.PropertyType}");
                sb.AppendLine($"Price: {p.Price:C} | Area: {p.Area} sqft | Location: {p.City}, {p.State}");
                var ownerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : "Unknown";
                sb.AppendLine($"Owner: {ownerName} | Status: {p.Status}");
                sb.AppendLine("--------------------------------------------------");
            }

            var pdfBytes = await _pdfService.GenerateReportPdfAsync("Properties Report", sb.ToString());
            return File(pdfBytes, "application/pdf", "PropertiesReport.pdf");
        }

        [HttpGet("bookings-pdf")]
        public async Task<IActionResult> ExportBookingsPdf()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Customer)
                    .ThenInclude(c => c.User)
                .Include(b => b.Property)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("Bookings Report");
            sb.AppendLine("--------------------------------------------------");
            
            foreach (var b in bookings)
            {
                sb.AppendLine($"Booking ID: {b.Id} | Property: {b.Property?.Title ?? "N/A"}");
                var customerName = b.Customer?.User != null ? $"{b.Customer.User.FirstName} {b.Customer.User.LastName}" : "Unknown";
                sb.AppendLine($"Customer: {customerName} | Visit Date: {b.VisitDate:g}");
                sb.AppendLine($"Status: {b.Status}");
                sb.AppendLine("--------------------------------------------------");
            }

            var pdfBytes = await _pdfService.GenerateReportPdfAsync("Bookings Report", sb.ToString());
            return File(pdfBytes, "application/pdf", "BookingsReport.pdf");
        }
        
        [HttpGet("payments-pdf")]
        public async Task<IActionResult> ExportPaymentsPdf()
        {
            var payments = await _context.Payments
                .Include(p => p.Customer)
                    .ThenInclude(c => c.User)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("Payments Report");
            sb.AppendLine("--------------------------------------------------");
            
            foreach (var p in payments)
            {
                sb.AppendLine($"Payment ID: {p.Id} | Booking ID: {p.BookingId}");
                var customerName = p.Customer?.User != null ? $"{p.Customer.User.FirstName} {p.Customer.User.LastName}" : "Unknown";
                sb.AppendLine($"Customer: {customerName} | Amount: {p.Amount:C}");
                sb.AppendLine($"Date: {p.PaymentDate:g} | Method: {p.PaymentMethod} | Status: {p.Status}");
                sb.AppendLine("--------------------------------------------------");
            }

            var pdfBytes = await _pdfService.GenerateReportPdfAsync("Payments Report", sb.ToString());
            return File(pdfBytes, "application/pdf", "PaymentsReport.pdf");
        }
    }
}
