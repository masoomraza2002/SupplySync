using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class VendorRepository : GenericRepository<Vendor>, IVendorRepository
{
    public VendorRepository(AppDbContext context) : base(context) { }

    public async Task<Vendor?> GetVendorWithDetailsAsync(int id) =>
        await _context.Vendors
            .Include(v => v.User)
            .Include(v => v.Contracts)
            .Include(v => v.PurchaseOrders)
            .Include(v => v.Invoices)
            .FirstOrDefaultAsync(v => v.Id == id);

    public async Task<IEnumerable<Vendor>> GetAllWithDetailsAsync() =>
        await _context.Vendors
            .Include(v => v.User)
            .ToListAsync();

    public async Task<Vendor?> GetByUserIdAsync(string userId) =>
        await _context.Vendors
            .Include(v => v.User)
            .FirstOrDefaultAsync(v => v.UserId == userId);
}