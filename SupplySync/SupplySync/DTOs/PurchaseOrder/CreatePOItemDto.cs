namespace SupplySync.API.DTOs.PurchaseOrder;

public class CreatePOItemDto
{
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}