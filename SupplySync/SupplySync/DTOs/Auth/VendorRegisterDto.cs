namespace SupplySync.API.DTOs.Auth;

public class VendorRegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string DocumentPath { get; set; } = string.Empty;
}