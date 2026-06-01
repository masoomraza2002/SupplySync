namespace SupplySync.API.Models;

public class Payment
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;
    public decimal AmountPaid { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string ProcessedByUserId { get; set; } = string.Empty;
}