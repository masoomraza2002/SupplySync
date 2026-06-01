namespace SupplySync.API.DTOs.Contract;

public class CreateContractDto
{
    public int VendorId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string PaymentTerms { get; set; } = string.Empty;
    public string DeliveryTerms { get; set; } = string.Empty;
    public string ItemPricing { get; set; } = string.Empty;
}