namespace SupplySync.API.DTOs.Vendor;

public class VendorReapplyDto
{
    public string TaxNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string DocumentPath { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}