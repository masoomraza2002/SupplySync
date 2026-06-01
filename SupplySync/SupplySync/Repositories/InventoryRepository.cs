using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class InventoryRepository : GenericRepository<InventoryItem>, IInventoryRepository
{
    public InventoryRepository(AppDbContext context) : base(context) { }

    public async Task<InventoryItem?> GetByNameAsync(string name) =>
        await _context.InventoryItems
            .FirstOrDefaultAsync(i =>
                i.ItemName.ToLower() == name.ToLower());

    public async Task<IEnumerable<InventoryItem>> GetAllWithIssuesAsync() =>
        await _context.InventoryItems
            .Include(i => i.Issues)
            .ToListAsync();

    public async Task<InventoryItem?> GetWithIssuesAsync(int id) =>
        await _context.InventoryItems
            .Include(i => i.Issues)
            .FirstOrDefaultAsync(i => i.Id == id);
}