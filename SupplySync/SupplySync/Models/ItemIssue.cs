namespace SupplySync.API.Models;

public class ItemIssue
{
    public int Id { get; set; }
    public int InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;
    public int QuantityIssued { get; set; }
    public string IssuedTo { get; set; } = string.Empty;  // Employee or Department
    public string IssuedByUserId { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public string Remarks { get; set; } = string.Empty;
}