using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IPurchaseOrderRepository : IGenericRepository<PurchaseOrder>
{
    Task<PurchaseOrder?> GetPOWithDetailsAsync(int id);
    Task<IEnumerable<PurchaseOrder>> GetAllWithDetailsAsync();
    Task<IEnumerable<PurchaseOrder>> GetByVendorIdAsync(int vendorId);
}