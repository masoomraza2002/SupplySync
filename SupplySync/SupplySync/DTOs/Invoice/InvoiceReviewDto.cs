namespace SupplySync.API.DTOs.Invoice;

public class InvoiceReviewDto
{
    public string Status { get; set; } = string.Empty; // Approved / Rejected
    public string? RejectionReason { get; set; }
}