namespace SupplySync.API.DTOs.Inventory;

public class IssueItemDto
{
    public int InventoryItemId { get; set; }
    public int QuantityIssued { get; set; }
    public string IssuedTo { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
