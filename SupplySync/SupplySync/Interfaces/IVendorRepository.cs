using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IVendorRepository : IGenericRepository<Vendor>
{
    Task<Vendor?> GetVendorWithDetailsAsync(int id);
    Task<IEnumerable<Vendor>> GetAllWithDetailsAsync();
    Task<Vendor?> GetByUserIdAsync(string userId);
}