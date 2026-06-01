using SupplySync.API.DTOs.Compliance;

namespace SupplySync.API.Interfaces;

public interface IComplianceService
{
    Task<IEnumerable<ComplianceCheckDto>> GetAllChecksAsync();
    Task<IEnumerable<ComplianceCheckDto>> GetByEntityAsync(string entityType, int entityId);
    Task<IEnumerable<ComplianceCheckDto>> GetFailedChecksAsync();
    Task<(bool Success, string Message, ComplianceCheckDto? Data)> PerformCheckAsync(
        CreateComplianceCheckDto dto, string checkedByUserId);
}