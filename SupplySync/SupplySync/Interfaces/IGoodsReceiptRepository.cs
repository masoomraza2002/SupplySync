using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IGoodsReceiptRepository : IGenericRepository<GoodsReceipt>
{
    Task<GoodsReceipt?> GetGRWithDetailsAsync(int id);
    Task<IEnumerable<GoodsReceipt>> GetAllWithDetailsAsync();
    Task<IEnumerable<GoodsReceipt>> GetByPOIdAsync(int poId);
}