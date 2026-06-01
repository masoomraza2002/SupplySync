using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class PurchaseOrderRepository : GenericRepository<PurchaseOrder>, IPurchaseOrderRepository
{
    public PurchaseOrderRepository(AppDbContext context) : base(context) { }

    public async Task<PurchaseOrder?> GetPOWithDetailsAsync(int id) =>
        await _context.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Contract)
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<PurchaseOrder>> GetAllWithDetailsAsync() =>
        await _context.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Contract)
            .Include(p => p.Items)
            .ToListAsync();

    public async Task<IEnumerable<PurchaseOrder>> GetByVendorIdAsync(int vendorId) =>
        await _context.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Contract)
            .Include(p => p.Items)
            .Where(p => p.VendorId == vendorId)
            .ToListAsync();
}