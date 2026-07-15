using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.DTOs;
using SmartRealEstate.Core.Entities;
using SmartRealEstate.Core.Enums;
using SmartRealEstate.Infrastructure.Data;
using System.Security.Claims;

namespace SmartRealEstate.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;

        public PaymentController(SmartRealEstateDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var query = _context.Payments
                .Include(p => p.Customer)
                    .ThenInclude(c => c.User)
                .AsQueryable();

            if (userRole == "Customer")
            {
                query = query.Where(p => p.CustomerId == userId);
            }
            // Admin sees all. Agents/Owners generally don't directly handle platform payments in this model unless specified.

            var payments = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            return Ok(payments.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var payment = await _context.Payments
                .Include(p => p.Customer)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null) return NotFound();

            if (userRole == "Customer" && payment.CustomerId != userId)
                return Forbid();

            return Ok(MapToDto(payment));
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<PaymentDto>> CreatePayment(CreatePaymentDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            // Ensure Customer exists
            var customer = await _context.Customers.FindAsync(userId);
            if (customer == null)
            {
                customer = new Customer { UserId = userId };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            // Optionally check booking
            if (dto.BookingId.HasValue)
            {
                var booking = await _context.Bookings.FindAsync(dto.BookingId.Value);
                if (booking == null) return BadRequest("Booking not found.");
                if (booking.CustomerId != userId) return Forbid("Not your booking.");
            }

            var payment = new Payment
            {
                BookingId = dto.BookingId,
                CustomerId = userId,
                Amount = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                TransactionId = dto.TransactionId,
                PaymentDate = DateTime.UtcNow,
                Status = PaymentStatus.Paid, // Simplified for mock payment
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            payment = await _context.Payments
                .Include(p => p.Customer)
                    .ThenInclude(c => c.User)
                .FirstAsync(p => p.Id == payment.Id);

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, MapToDto(payment));
        }

        private static PaymentDto MapToDto(Payment p)
        {
            return new PaymentDto
            {
                Id = p.Id,
                BookingId = p.BookingId,
                CustomerId = p.CustomerId,
                CustomerName = p.Customer?.User != null ? $"{p.Customer.User.FirstName} {p.Customer.User.LastName}" : string.Empty,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                TransactionId = p.TransactionId,
                Status = p.Status.ToString(),
                CreatedAt = p.CreatedAt
            };
        }
    }
}
