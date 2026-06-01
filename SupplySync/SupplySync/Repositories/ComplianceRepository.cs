using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Repositories;

public class ComplianceRepository : GenericRepository<ComplianceCheck>, IComplianceRepository
{
    public ComplianceRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<ComplianceCheck>> GetByEntityAsync(
        string entityType, int entityId) =>
        await _context.ComplianceChecks
            .Where(c => c.EntityType == entityType && c.EntityId == entityId)
            .OrderByDescending(c => c.CheckedAt)
            .ToListAsync();

    public async Task<IEnumerable<ComplianceCheck>> GetFailedChecksAsync() =>
        await _context.ComplianceChecks
            .Where(c => c.Status == ComplianceStatus.Fail)
            .OrderByDescending(c => c.CheckedAt)
            .ToListAsync();
}