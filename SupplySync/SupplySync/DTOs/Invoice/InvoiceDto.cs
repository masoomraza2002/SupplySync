namespace SupplySync.API.DTOs.Invoice;

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public int PurchaseOrderId { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public int GoodsReceiptId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public DateTime SubmittedAt { get; set; }

    public bool IsPaid { get; set; }
    public string? PaymentReference { get; set; }
    public DateTime? PaymentDate { get; set; }
}