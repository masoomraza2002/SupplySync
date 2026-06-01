namespace SupplySync.API.DTOs.Contract;

public class ContractDto
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string DeliveryTerms { get; set; } = string.Empty;
    public string ItemPricing { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}