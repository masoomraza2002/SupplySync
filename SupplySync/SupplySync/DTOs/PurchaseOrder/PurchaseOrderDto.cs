namespace SupplySync.API.DTOs.PurchaseOrder;

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int ContractId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public DateTime ExpectedDeliveryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<POItemDto> Items { get; set; } = new();
}