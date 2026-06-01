using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(AppDbContext context) : base(context) { }

    public async Task<Invoice?> GetInvoiceWithDetailsAsync(int id) =>
        await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseOrder)
                .ThenInclude(p => p.Items)
            .Include(i => i.GoodsReceipt)
                .ThenInclude(g => g.Items)
            .Include(i => i.Payment)
            .FirstOrDefaultAsync(i => i.Id == id);

    public async Task<IEnumerable<Invoice>> GetAllWithDetailsAsync() =>
        await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseOrder)
            .Include(i => i.GoodsReceipt)
            .Include(i => i.Payment)
            .ToListAsync();

    public async Task<IEnumerable<Invoice>> GetByVendorIdAsync(int vendorId) =>
        await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseOrder)
            .Include(i => i.GoodsReceipt)
            .Include(i => i.Payment)
            .Where(i => i.VendorId == vendorId)
            .ToListAsync();

    public async Task<bool> IsDuplicateInvoiceAsync(int poId, int grId) =>
    await _context.Invoices
        .Include(i => i.GoodsReceipt)
        .AnyAsync(i =>
            i.PurchaseOrderId == poId &&
            i.GoodsReceiptId == grId &&
            i.Status != InvoiceStatus.Rejected &&
            i.GoodsReceipt.Status != GoodsReceiptStatus.Rejected);
}