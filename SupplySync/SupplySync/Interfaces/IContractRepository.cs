using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IContractRepository : IGenericRepository<Contract>
{
    Task<Contract?> GetContractWithDetailsAsync(int id);
    Task<IEnumerable<Contract>> GetAllWithDetailsAsync();
    Task<IEnumerable<Contract>> GetByVendorIdAsync(int vendorId);
}