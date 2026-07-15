using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.DTOs;
using SmartRealEstate.Core.Entities;
using SmartRealEstate.Core.Enums;
using SmartRealEstate.Core.Interfaces;
using SmartRealEstate.Infrastructure.Data;
using System.Security.Claims;

namespace SmartRealEstate.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _context;
        private readonly IImageStorageService _storageService;

        public PropertyController(SmartRealEstateDbContext context, IImageStorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PropertyDto>>> GetProperties([FromQuery] PropertyFilterDto filter)
        {
            var query = _context.Properties
                .Include(p => p.Images)
                .Include(p => p.Owner)
                .Include(p => p.Reviews)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var term = filter.SearchTerm.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(term) || p.City.ToLower().Contains(term) || p.Address.ToLower().Contains(term));
            }

            if (!string.IsNullOrEmpty(filter.PropertyType))
                query = query.Where(p => p.PropertyType == filter.PropertyType);
            
            if (!string.IsNullOrEmpty(filter.City))
                query = query.Where(p => p.City == filter.City);
            
            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            
            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            
            if (filter.Bedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= filter.Bedrooms.Value);
            
            if (filter.Bathrooms.HasValue)
                query = query.Where(p => p.Bathrooms >= filter.Bathrooms.Value);
            
            if (filter.Parking.HasValue)
                query = query.Where(p => p.Parking == filter.Parking.Value);
            
            if (filter.Furnished.HasValue)
                query = query.Where(p => p.Furnished == filter.Furnished.Value);
            
            if (filter.Status.HasValue)
                query = query.Where(p => p.Status == filter.Status.Value);
            else
                query = query.Where(p => p.Status == PropertyStatus.Available);

            query = filter.SortBy.ToLower() switch
            {
                "price" => filter.SortDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
                "area" => filter.SortDescending ? query.OrderByDescending(p => p.Area) : query.OrderBy(p => p.Area),
                _ => filter.SortDescending ? query.OrderByDescending(p => p.CreatedDate) : query.OrderBy(p => p.CreatedDate),
            };

            var totalItems = await query.CountAsync();
            
            var properties = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var dtos = properties.Select(MapToDto).ToList();

            Response.Headers.Append("X-Total-Count", totalItems.ToString());

            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyDto>> GetProperty(int id)
        {
            var property = await _context.Properties
                .Include(p => p.Images)
                .Include(p => p.Owner)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property == null) return NotFound();

            var dto = MapToDto(property);
            
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdString, out int userId))
                {
                    dto.IsWishlisted = await _context.Wishlists.AnyAsync(w => w.PropertyId == id && w.CustomerId == userId);
                }
            }

            return Ok(dto);
        }

        [Authorize(Roles = "Admin,Agent,Owner")]
        [HttpPost]
        public async Task<ActionResult<PropertyDto>> CreateProperty(PropertyCreateDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var property = new Property
            {
                Title = dto.Title,
                Description = dto.Description,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Country = dto.Country,
                PropertyType = dto.PropertyType,
                Price = dto.Price,
                Area = dto.Area,
                Bedrooms = dto.Bedrooms,
                Bathrooms = dto.Bathrooms,
                Parking = dto.Parking,
                Furnished = dto.Furnished,
                Amenities = dto.Amenities,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                OwnerId = userId,
                Status = PropertyStatus.Available,
                CreatedDate = DateTime.UtcNow
            };

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            // Load owner for DTO mapping
            await _context.Entry(property).Reference(p => p.Owner).LoadAsync();

            return CreatedAtAction(nameof(GetProperty), new { id = property.Id }, MapToDto(property));
        }

        [Authorize(Roles = "Admin,Agent,Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(int id, PropertyUpdateDto dto)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null) return NotFound();

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            if (property.OwnerId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            property.Title = dto.Title;
            property.Description = dto.Description;
            property.Address = dto.Address;
            property.City = dto.City;
            property.State = dto.State;
            property.Country = dto.Country;
            property.PropertyType = dto.PropertyType;
            property.Price = dto.Price;
            property.Area = dto.Area;
            property.Bedrooms = dto.Bedrooms;
            property.Bathrooms = dto.Bathrooms;
            property.Parking = dto.Parking;
            property.Furnished = dto.Furnished;
            property.Amenities = dto.Amenities;
            property.Latitude = dto.Latitude;
            property.Longitude = dto.Longitude;
            property.Status = dto.Status;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin,Agent,Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            var property = await _context.Properties.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);
            if (property == null) return NotFound();

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            if (property.OwnerId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            // Delete images from storage first
            foreach (var img in property.Images)
            {
                await _storageService.DeleteImageAsync(img.ImageUrl);
            }

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin,Agent,Owner")]
        [HttpPost("{id}/images")]
        public async Task<ActionResult<PropertyImageDto>> UploadImage(int id, IFormFile file, [FromForm] bool isPrimary = false)
        {
            var property = await _context.Properties.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);
            if (property == null) return NotFound();

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            if (property.OwnerId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Invalid image format.");

            using var stream = file.OpenReadStream();
            var imageUrl = await _storageService.UploadImageAsync(stream, file.FileName, file.ContentType);

            if (isPrimary && property.Images.Any())
            {
                foreach (var img in property.Images)
                {
                    img.IsPrimary = false;
                }
            }
            else if (!property.Images.Any())
            {
                isPrimary = true; // First image is always primary
            }

            var propertyImage = new PropertyImage
            {
                PropertyId = id,
                ImageUrl = imageUrl,
                IsPrimary = isPrimary,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<PropertyImage>().Add(propertyImage);
            await _context.SaveChangesAsync();

            return Ok(new PropertyImageDto
            {
                Id = propertyImage.Id,
                ImageUrl = propertyImage.ImageUrl,
                IsPrimary = propertyImage.IsPrimary
            });
        }

        [Authorize(Roles = "Admin,Agent,Owner")]
        [HttpDelete("{id}/images/{imageId}")]
        public async Task<IActionResult> DeleteImage(int id, int imageId)
        {
            var property = await _context.Properties.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);
            if (property == null) return NotFound();

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            if (property.OwnerId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            var image = property.Images.FirstOrDefault(i => i.Id == imageId);
            if (image == null) return NotFound();

            await _storageService.DeleteImageAsync(image.ImageUrl);
            
            _context.Set<PropertyImage>().Remove(image);
            await _context.SaveChangesAsync();

            // If we deleted the primary image, make another one primary
            if (image.IsPrimary)
            {
                var nextPrimary = property.Images.FirstOrDefault(i => i.Id != imageId);
                if (nextPrimary != null)
                {
                    nextPrimary.IsPrimary = true;
                    await _context.SaveChangesAsync();
                }
            }

            return NoContent();
        }

        private static PropertyDto MapToDto(Property p)
        {
            return new PropertyDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Address = p.Address,
                City = p.City,
                State = p.State,
                Country = p.Country,
                PropertyType = p.PropertyType,
                Price = p.Price,
                Area = p.Area,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                Parking = p.Parking,
                Furnished = p.Furnished,
                Amenities = p.Amenities,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                OwnerId = p.OwnerId,
                OwnerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : string.Empty,
                OwnerEmail = p.Owner != null ? p.Owner.Email : string.Empty,
                OwnerPhone = p.Owner != null ? p.Owner.PhoneNumber : string.Empty,
                Status = p.Status.ToString(),
                CreatedDate = p.CreatedDate,
                Images = p.Images.Select(i => new PropertyImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    IsPrimary = i.IsPrimary
                }).ToList(),
                TotalReviews = p.Reviews?.Count ?? 0,
                AverageRating = p.Reviews != null && p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => r.Rating), 1) : 0
            };
        }
    }
}
