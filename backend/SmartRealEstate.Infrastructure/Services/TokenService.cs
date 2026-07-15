using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartRealEstate.Core.Entities;
using SmartRealEstate.Core.Interfaces;

namespace SmartRealEstate.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateAccessToken(User user)
        {
            var secretKey = _configuration["JwtSettings:Secret"] ?? "SmartRealEstateSuperSecretKeyChangeThisInProduction123456!";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "SmartRealEstateApi";
            var audience = _configuration["JwtSettings:Audience"] ?? "SmartRealEstateClient";
            var expiryInMinutes = double.Parse(_configuration["JwtSettings:ExpiryInMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.Name),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken(string ipAddress)
        {
            var expiryInDays = double.Parse(_configuration["JwtSettings:RefreshTokenExpiryInDays"] ?? "7");
            
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomNumber),
                Expires = DateTime.UtcNow.AddDays(expiryInDays),
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };
        }
    }
}
