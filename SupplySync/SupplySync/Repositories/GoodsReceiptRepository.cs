using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class GoodsReceiptRepository : GenericRepository<GoodsReceipt>, IGoodsReceiptRepository
{
    public GoodsReceiptRepository(AppDbContext context) : base(context) { }

    public async Task<GoodsReceipt?> GetGRWithDetailsAsync(int id) =>
        await _context.GoodsReceipts
            .Include(g => g.PurchaseOrder)
                .ThenInclude(p => p.Vendor)
            .Include(g => g.Items)
            .FirstOrDefaultAsync(g => g.Id == id);

    public async Task<IEnumerable<GoodsReceipt>> GetAllWithDetailsAsync() =>
        await _context.GoodsReceipts
            .Include(g => g.PurchaseOrder)
                .ThenInclude(p => p.Vendor)
            .Include(g => g.Items)
            .ToListAsync();

    public async Task<IEnumerable<GoodsReceipt>> GetByPOIdAsync(int poId) =>
        await _context.GoodsReceipts
            .Include(g => g.PurchaseOrder)
            .Include(g => g.Items)
            .Where(g => g.PurchaseOrderId == poId)
            .ToListAsync();
}