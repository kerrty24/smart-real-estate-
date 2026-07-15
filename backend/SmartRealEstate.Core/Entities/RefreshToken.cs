using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartRealEstate.Core.Entities
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Token { get; set; } = string.Empty;

        [Required]
        public DateTime Expires { get; set; }

        public bool IsExpired => DateTime.UtcNow >= Expires;

        public DateTime Created { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(100)]
        public string CreatedByIp { get; set; } = string.Empty;

        public DateTime? Revoked { get; set; }

        [MaxLength(100)]
        public string? RevokedByIp { get; set; }

        [MaxLength(255)]
        public string? ReplacedByToken { get; set; }

        public bool IsActive => Revoked == null && !IsExpired;

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}
