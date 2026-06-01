namespace SupplySync.API.DTOs.PurchaseOrder;

public class CreatePurchaseOrderDto
{
    public int VendorId { get; set; }
    public int ContractId { get; set; }
    public DateTime ExpectedDeliveryDate { get; set; }
    public List<CreatePOItemDto> Items { get; set; } = new();
}