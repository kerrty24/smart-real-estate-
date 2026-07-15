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
    public class RentalAgreementController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;

        public RentalAgreementController(SmartRealEstateDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RentalAgreementDto>>> GetAgreements()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = _context.RentalAgreements
                .Include(ra => ra.Property)
                .Include(ra => ra.Customer)
                .ThenInclude(c => c.User)
                .AsQueryable();

            if (userRole == "Customer")
            {
                query = query.Where(ra => ra.Customer.UserId == userId);
            }
            else if (userRole == "Agent")
            {
                query = query.Where(ra => ra.Property.OwnerId == userId);
            }

            var agreements = await query.OrderByDescending(ra => ra.CreatedAt).ToListAsync();

            var dtos = agreements.Select(ra => new RentalAgreementDto
            {
                Id = ra.Id,
                PropertyId = ra.PropertyId,
                PropertyTitle = ra.Property.Title,
                CustomerId = ra.CustomerId,
                CustomerName = $"{ra.Customer.User.FirstName} {ra.Customer.User.LastName}",
                StartDate = ra.StartDate,
                EndDate = ra.EndDate,
                MonthlyRent = ra.MonthlyRent,
                SecurityDeposit = ra.SecurityDeposit,
                Status = ra.Status,
                DocumentUrl = ra.DocumentUrl,
                CreatedAt = ra.CreatedAt
            });

            return Ok(dtos);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<ActionResult<RentalAgreementDto>> CreateAgreement(CreateRentalAgreementDto dto)
        {
            var property = await _context.Properties.FindAsync(dto.PropertyId);
            if (property == null) return NotFound("Property not found.");

            var customer = await _context.Customers.Include(c => c.User).FirstOrDefaultAsync(c => c.UserId == dto.CustomerId);
            if (customer == null) return NotFound("Customer not found.");

            var agreement = new RentalAgreement
            {
                PropertyId = dto.PropertyId,
                CustomerId = dto.CustomerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                MonthlyRent = dto.MonthlyRent,
                SecurityDeposit = dto.SecurityDeposit,
                Status = AgreementStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.RentalAgreements.Add(agreement);
            await _context.SaveChangesAsync();

            var responseDto = new RentalAgreementDto
            {
                Id = agreement.Id,
                PropertyId = agreement.PropertyId,
                PropertyTitle = property.Title,
                CustomerId = agreement.CustomerId,
                CustomerName = $"{customer.User.FirstName} {customer.User.LastName}",
                StartDate = agreement.StartDate,
                EndDate = agreement.EndDate,
                MonthlyRent = agreement.MonthlyRent,
                SecurityDeposit = agreement.SecurityDeposit,
                Status = agreement.Status,
                CreatedAt = agreement.CreatedAt
            };

            return CreatedAtAction(nameof(GetAgreements), new { id = agreement.Id }, responseDto);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateAgreementStatusDto dto)
        {
            var agreement = await _context.RentalAgreements.FindAsync(id);
            if (agreement == null) return NotFound();

            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Customers can only accept (Active) or decline (Terminated) pending agreements
            if (userRole == "Customer" && agreement.CustomerId == userId)
            {
                if (dto.Status != AgreementStatus.Active && dto.Status != AgreementStatus.Terminated)
                {
                    return Forbid();
                }
            }
            else if (userRole != "Admin" && userRole != "Agent")
            {
                return Forbid();
            }

            agreement.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
