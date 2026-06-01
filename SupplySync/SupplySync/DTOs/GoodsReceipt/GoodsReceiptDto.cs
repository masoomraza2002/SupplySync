namespace SupplySync.API.DTOs.GoodsReceipt;

public class GoodsReceiptDto
{
    public int Id { get; set; }
    public string GRNumber { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public DateTime ReceivedDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<GoodsReceiptItemDto> Items { get; set; } = new();
}