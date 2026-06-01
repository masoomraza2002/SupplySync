using SupplySync.API.Models;

namespace SupplySync.API.DTOs.Vendor;

public class VendorDto
{
    public int Id { get; set; }
    public string VendorCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string DocumentPath { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
}