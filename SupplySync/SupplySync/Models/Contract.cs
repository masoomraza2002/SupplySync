namespace SupplySync.API.Models;

public class Contract
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string DeliveryTerms { get; set; } = string.Empty;
    public string ItemPricing { get; set; } = string.Empty; // JSON or text
    public ContractStatus Status { get; set; } = ContractStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedByUserId { get; set; } = string.Empty;

    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}

public enum ContractStatus { Draft, Active, Closed }