namespace SupplySync.API.Models;

public class GoodsReceipt
{
    public int Id { get; set; }
    public string GRNumber { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
    public string ReceivedByUserId { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public GoodsReceiptStatus Status { get; set; } = GoodsReceiptStatus.Accepted;

    public ICollection<GoodsReceiptItem> Items { get; set; } = new List<GoodsReceiptItem>();
}

public enum GoodsReceiptStatus { Accepted, Rejected, PartiallyAccepted }