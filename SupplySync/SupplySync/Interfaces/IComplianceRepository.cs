using SupplySync.API.Models;

namespace SupplySync.API.Interfaces;

public interface IComplianceRepository : IGenericRepository<ComplianceCheck>
{
    Task<IEnumerable<ComplianceCheck>> GetByEntityAsync(string entityType, int entityId);
    Task<IEnumerable<ComplianceCheck>> GetFailedChecksAsync();
}