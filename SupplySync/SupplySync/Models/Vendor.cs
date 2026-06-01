using System.Diagnostics.Contracts;

namespace SupplySync.API.Models;

public class Vendor
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
    public VendorStatus Status { get; set; } = VendorStatus.Pending;
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public enum VendorStatus { Pending, Approved, Rejected, Suspended }