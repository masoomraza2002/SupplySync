using SupplySync.API.DTOs.Vendor;

namespace SupplySync.API.Interfaces;

public interface IVendorService
{
    Task<IEnumerable<VendorDto>> GetAllVendorsAsync();
    Task<VendorDto?> GetVendorByIdAsync(int id);
    Task<VendorDto?> GetVendorByUserIdAsync(string userId);
    Task<(bool Success, string Message)> UpdateVendorStatusAsync(int id, VendorStatusUpdateDto dto, string updatedByUserId);
    Task<(bool Success, string Message)> SuspendVendorAsync(int id);
    Task<(bool Success, string Message)> ReapplyAsync(string userId, VendorReapplyDto dto);
}