using SupplySync.API.DTOs.Invoice;

namespace SupplySync.API.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync();
    Task<InvoiceDto?> GetInvoiceByIdAsync(int id);
    Task<IEnumerable<InvoiceDto>> GetInvoicesByVendorAsync(int vendorId);
    Task<(bool Success, string Message, InvoiceDto? Data)> SubmitInvoiceAsync(
        CreateInvoiceDto dto, string vendorUserId);
    Task<(bool Success, string Message)> ReviewInvoiceAsync(
        int id, InvoiceReviewDto dto, string reviewedByUserId);
    Task<(bool Success, string Message)> ProcessPaymentAsync(
        CreatePaymentDto dto, string processedByUserId);
}