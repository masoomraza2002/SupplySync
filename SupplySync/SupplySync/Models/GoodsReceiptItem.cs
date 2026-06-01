namespace SupplySync.API.Models;

public class GoodsReceiptItem
{
    public int Id { get; set; }
    public int GoodsReceiptId { get; set; }
    public GoodsReceipt GoodsReceipt { get; set; } = null!;
    public string ItemName { get; set; } = string.Empty;
    public int ReceivedQuantity { get; set; }
    public string Condition { get; set; } = string.Empty; // Good / Damaged
}