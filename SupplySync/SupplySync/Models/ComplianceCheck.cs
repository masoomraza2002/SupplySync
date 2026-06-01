namespace SupplySync.API.Models;

public class ComplianceCheck
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty; // Vendor, Contract, PO, Invoice
    public int EntityId { get; set; }
    public ComplianceStatus Status { get; set; } = ComplianceStatus.Pending;
    public string Remarks { get; set; } = string.Empty;
    public string CheckedByUserId { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}

public enum ComplianceStatus { Pending, Pass, Fail }