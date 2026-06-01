using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class ContractRepository : GenericRepository<Contract>, IContractRepository
{
    public ContractRepository(AppDbContext context) : base(context) { }

    public async Task<Contract?> GetContractWithDetailsAsync(int id) =>
        await _context.Contracts
            .Include(c => c.Vendor)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Contract>> GetAllWithDetailsAsync() =>
        await _context.Contracts
            .Include(c => c.Vendor)
            .ToListAsync();

    public async Task<IEnumerable<Contract>> GetByVendorIdAsync(int vendorId) =>
        await _context.Contracts
            .Include(c => c.Vendor)
            .Where(c => c.VendorId == vendorId)
            .ToListAsync();
}