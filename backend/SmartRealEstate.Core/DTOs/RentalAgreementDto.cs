using System;
using SmartRealEstate.Core.Enums;

namespace SmartRealEstate.Core.DTOs
{
    public class RentalAgreementDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal SecurityDeposit { get; set; }
        public AgreementStatus Status { get; set; }
        public string DocumentUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRentalAgreementDto
    {
        public int PropertyId { get; set; }
        public int CustomerId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal SecurityDeposit { get; set; }
    }

    public class UpdateAgreementStatusDto
    {
        public AgreementStatus Status { get; set; }
    }
}
