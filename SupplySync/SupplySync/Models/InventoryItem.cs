namespace SupplySync.API.Models;

public class InventoryItem
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int QuantityInStock { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public ICollection<ItemIssue> Issues { get; set; } = new List<ItemIssue>();
}