namespace SupplySync.API.DTOs.Vendor;

public class VendorStatusUpdateDto
{
    public string Status { get; set; } = string.Empty; // Approved / Rejected
    public string? RejectionReason { get; set; }
}