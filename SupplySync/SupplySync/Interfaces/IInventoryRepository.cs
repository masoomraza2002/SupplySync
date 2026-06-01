using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IInventoryRepository : IGenericRepository<InventoryItem>
{
    Task<InventoryItem?> GetByNameAsync(string name);
    Task<IEnumerable<InventoryItem>> GetAllWithIssuesAsync();
    Task<InventoryItem?> GetWithIssuesAsync(int id);
}