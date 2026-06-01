namespace SupplySync.API.DTOs.Inventory;

public class ItemIssueDto
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int QuantityIssued { get; set; }
    public string IssuedTo { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
}