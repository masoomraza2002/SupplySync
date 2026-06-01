using SupplySync.API.DTOs.PurchaseOrder;

namespace SupplySync.API.Interfaces;

public interface IPurchaseOrderService
{
    Task<IEnumerable<PurchaseOrderDto>> GetAllPOsAsync();
    Task<PurchaseOrderDto?> GetPOByIdAsync(int id);
    Task<IEnumerable<PurchaseOrderDto>> GetPOsByVendorAsync(int vendorId);
    Task<(bool Success, string Message, PurchaseOrderDto? Data)> CreatePOAsync(CreatePurchaseOrderDto dto, string userId);
    Task<(bool Success, string Message)> UpdatePOStatusAsync(int id, string status);
    Task<(bool Success, string Message)> CancelPOAsync(int id);
}