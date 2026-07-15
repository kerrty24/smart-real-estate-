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
    public class InquiryController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;

        public InquiryController(SmartRealEstateDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InquiryDto>>> GetInquiries()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = _context.Inquiries
                .Include(i => i.Property)
                .Include(i => i.Customer)
                .ThenInclude(c => c.User)
                .AsQueryable();

            if (userRole == "Customer")
            {
                query = query.Where(i => i.Customer.UserId == userId);
            }
            else if (userRole == "Agent")
            {
                query = query.Where(i => i.Property.OwnerId == userId);
            }

            var inquiries = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();

            var dtos = inquiries.Select(i => new InquiryDto
            {
                Id = i.Id,
                PropertyId = i.PropertyId,
                PropertyTitle = i.Property.Title,
                CustomerId = i.CustomerId,
                CustomerName = $"{i.Customer.User.FirstName} {i.Customer.User.LastName}",
                Message = i.Message,
                Reply = i.Reply,
                Status = i.Status,
                CreatedAt = i.CreatedAt
            });

            return Ok(dtos);
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<InquiryDto>> CreateInquiry(CreateInquiryDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var customer = await _context.Customers.Include(c => c.User).FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (customer == null) return NotFound("Customer not found.");

            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null) return NotFound("Property not found.");

            var inquiry = new Inquiry
            {
                PropertyId = dto.PropertyId,
                CustomerId = customer.UserId,
                Message = dto.Message,
                Status = InquiryStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            var responseDto = new InquiryDto
            {
                Id = inquiry.Id,
                PropertyId = inquiry.PropertyId,
                PropertyTitle = property.Title,
                CustomerId = inquiry.CustomerId,
                CustomerName = $"{customer.User.FirstName} {customer.User.LastName}",
                Message = inquiry.Message,
                Status = inquiry.Status,
                CreatedAt = inquiry.CreatedAt
            };

            return CreatedAtAction(nameof(GetInquiries), new { id = inquiry.Id }, responseDto);
        }

        [HttpPut("{id}/reply")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> ReplyInquiry(int id, ReplyInquiryDto dto)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry == null) return NotFound();

            inquiry.Reply = dto.Reply;
            inquiry.Status = InquiryStatus.Answered;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
