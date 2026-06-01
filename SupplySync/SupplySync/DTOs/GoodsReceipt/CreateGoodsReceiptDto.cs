namespace SupplySync.API.DTOs.GoodsReceipt;

public class CreateGoodsReceiptDto
{
    public int PurchaseOrderId { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Status { get; set; } = "Accepted";
    public List<GoodsReceiptItemDto> Items { get; set; } = new();
}