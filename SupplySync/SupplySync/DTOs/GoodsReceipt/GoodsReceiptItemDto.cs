namespace SupplySync.API.DTOs.GoodsReceipt;

public class GoodsReceiptItemDto
{
    public string ItemName { get; set; } = string.Empty;
    public int ReceivedQuantity { get; set; }
    public string Condition { get; set; } = string.Empty;
}