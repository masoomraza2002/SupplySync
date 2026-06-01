namespace SupplySync.API.DTOs.Invoice;

public class CreatePaymentDto
{
    public int InvoiceId { get; set; }
    public decimal AmountPaid { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
}