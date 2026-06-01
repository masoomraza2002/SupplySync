namespace SupplySync.API.DTOs.Inventory;

public class CreateInventoryItemDto
{
    public string ItemName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantityInStock { get; set; }
    public string Unit { get; set; } = string.Empty;
}