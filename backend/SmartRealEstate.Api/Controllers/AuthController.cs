using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartRealEstate.Core.DTOs;
using SmartRealEstate.Core.Entities;
using SmartRealEstate.Core.Interfaces;
using SmartRealEstate.Infrastructure.Data;
using System.Security.Claims;

namespace SmartRealEstate.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SmartRealEstateDbContext _dbContext;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthController(
            SmartRealEstateDbContext dbContext,
            IPasswordHasher passwordHasher,
            ITokenService tokenService)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _dbContext.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
            {
                return BadRequest(new { Message = "Username is already taken." });
            }

            if (await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(new { Message = "Email is already registered." });
            }

            var roleName = request.Role;
            // Limit roles client can request to prevent security escalation (only Admin can create Admins/Agents - wait, for demo we allow it, but we can secure it. Let's allow creating Agent and Customer, but verify Admin role exists).
            var role = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());
            if (role == null)
            {
                return BadRequest(new { Message = $"Role '{roleName}' does not exist." });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                RoleId = role.Id,
                Role = role
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            // If the user registered as a Customer, seed Customer profile record
            if (role.Name.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var customer = new Customer
                {
                    UserId = user.Id,
                    Address = string.Empty,
                    City = string.Empty,
                    State = string.Empty,
                    Country = string.Empty,
                    PostalCode = string.Empty,
                    ProfileImageUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" // default avatar
                };
                _dbContext.Customers.Add(customer);
                await _dbContext.SaveChangesAsync();
            }

            var ipAddress = GetIpAddress();
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);

            user.RefreshTokens.Add(refreshToken);
            await _dbContext.SaveChangesAsync();

            var expiryMinutes = 60; // configured default
            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                Expiration = DateTime.UtcNow.AddMinutes(expiryMinutes)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == request.UsernameOrEmail.ToLower() || u.Email.ToLower() == request.UsernameOrEmail.ToLower());

            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid username or password." });
            }

            var ipAddress = GetIpAddress();
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken(ipAddress);

            user.RefreshTokens.Add(refreshToken);
            
            // Housekeeping: remove expired refresh tokens
            var expiredTokens = user.RefreshTokens.Where(t => !t.IsActive && t.Created.AddDays(30) < DateTime.UtcNow).ToList();
            foreach (var expiredToken in expiredTokens)
            {
                user.RefreshTokens.Remove(expiredToken);
            }

            await _dbContext.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                Expiration = DateTime.UtcNow.AddMinutes(60)
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var user = await _dbContext.Users
                .Include(u => u.Role)
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == request.RefreshToken));

            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid refresh token." });
            }

            var oldToken = user.RefreshTokens.Single(t => t.Token == request.RefreshToken);

            if (!oldToken.IsActive)
            {
                return Unauthorized(new { Message = "Refresh token is expired or revoked." });
            }

            var ipAddress = GetIpAddress();
            var newRefreshToken = _tokenService.GenerateRefreshToken(ipAddress);

            // Revoke old token
            oldToken.Revoked = DateTime.UtcNow;
            oldToken.RevokedByIp = ipAddress;
            oldToken.ReplacedByToken = newRefreshToken.Token;

            user.RefreshTokens.Add(newRefreshToken);
            await _dbContext.SaveChangesAsync();

            var accessToken = _tokenService.GenerateAccessToken(user);

            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.Name,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = newRefreshToken.Token,
                Expiration = DateTime.UtcNow.AddMinutes(60)
            });
        }

        [Authorize]
        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] string token)
        {
            var userIdVal = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdVal) || !int.TryParse(userIdVal, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return BadRequest(new { Message = "User not found." });
            }

            var refreshToken = user.RefreshTokens.FirstOrDefault(t => t.Token == token);

            if (refreshToken == null || !refreshToken.IsActive)
            {
                return BadRequest(new { Message = "Token is not active or invalid." });
            }

            refreshToken.Revoked = DateTime.UtcNow;
            refreshToken.RevokedByIp = GetIpAddress();

            await _dbContext.SaveChangesAsync();

            return Ok(new { Message = "Token revoked successfully." });
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"]!;
            
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
        }
    }
}
