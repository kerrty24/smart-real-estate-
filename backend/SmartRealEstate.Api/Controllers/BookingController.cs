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
    public class BookingController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;

        public BookingController(SmartRealEstateDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var query = _context.Bookings
                .Include(b => b.Customer)
                    .ThenInclude(c => c.User)
                .Include(b => b.Property)
                .AsQueryable();

            if (userRole == "Customer")
            {
                query = query.Where(b => b.CustomerId == userId); // CustomerId is same as UserId
            }
            else if (userRole == "Agent" || userRole == "Owner")
            {
                // Agents and Owners can only see bookings for their own properties
                query = query.Where(b => b.Property.OwnerId == userId);
            }
            // Admin sees all.

            var bookings = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();

            return Ok(bookings.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var booking = await _context.Bookings
                .Include(b => b.Customer)
                    .ThenInclude(c => c.User)
                .Include(b => b.Property)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();

            if (userRole == "Customer" && booking.CustomerId != userId)
                return Forbid();
            if ((userRole == "Agent" || userRole == "Owner") && booking.Property.OwnerId != userId)
                return Forbid();

            return Ok(MapToDto(booking));
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null) return BadRequest("Property not found.");

            // Check if Customer entity exists, if not, create it
            var customer = await _context.Customers.FindAsync(userId);
            if (customer == null)
            {
                customer = new Customer { UserId = userId };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            var booking = new Booking
            {
                CustomerId = userId,
                PropertyId = dto.PropertyId,
                VisitDate = dto.VisitDate,
                Notes = dto.Notes,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Reload with includes for DTO mapping
            booking = await _context.Bookings
                .Include(b => b.Customer)
                    .ThenInclude(c => c.User)
                .Include(b => b.Property)
                .FirstAsync(b => b.Id == booking.Id);

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(booking));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, UpdateBookingStatusDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var booking = await _context.Bookings.Include(b => b.Property).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return NotFound();

            // Authorization logic
            if (userRole == "Customer")
            {
                if (booking.CustomerId != userId) return Forbid();
                // Customers can only cancel their bookings
                if (dto.Status != BookingStatus.Cancelled) return BadRequest("Customers can only cancel bookings.");
            }
            else if (userRole == "Agent" || userRole == "Owner")
            {
                if (booking.Property.OwnerId != userId) return Forbid();
                // Owners/Agents can approve, reject, or complete
                if (dto.Status == BookingStatus.Pending) return BadRequest("Cannot revert to pending.");
            }

            booking.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static BookingDto MapToDto(Booking b)
        {
            return new BookingDto
            {
                Id = b.Id,
                CustomerId = b.CustomerId,
                CustomerName = b.Customer?.User != null ? $"{b.Customer.User.FirstName} {b.Customer.User.LastName}" : string.Empty,
                CustomerEmail = b.Customer?.User?.Email ?? string.Empty,
                PropertyId = b.PropertyId,
                PropertyTitle = b.Property?.Title ?? string.Empty,
                VisitDate = b.VisitDate,
                Status = b.Status.ToString(),
                Notes = b.Notes,
                CreatedAt = b.CreatedAt
            };
        }
    }
}
