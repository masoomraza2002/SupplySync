using System.Reflection;

namespace SupplySync.API.Models;

public class PurchaseOrder
{
    public int Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    public int ContractId { get; set; }
    public Contract Contract { get; set; } = null!;
    public DateTime ExpectedDeliveryDate { get; set; }
    public POStatus Status { get; set; } = POStatus.Created;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedByUserId { get; set; } = string.Empty;

    public ICollection<POItem> Items { get; set; } = new List<POItem>();
    public ICollection<GoodsReceipt> GoodsReceipts { get; set; } = new List<GoodsReceipt>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public enum POStatus { Created, Sent, Delivered, Cancelled }