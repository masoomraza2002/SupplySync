using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IInvoiceRepository : IGenericRepository<Invoice>
{
    Task<Invoice?> GetInvoiceWithDetailsAsync(int id);
    Task<IEnumerable<Invoice>> GetAllWithDetailsAsync();
    Task<IEnumerable<Invoice>> GetByVendorIdAsync(int vendorId);
    Task<bool> IsDuplicateInvoiceAsync(int poId, int grId);
}