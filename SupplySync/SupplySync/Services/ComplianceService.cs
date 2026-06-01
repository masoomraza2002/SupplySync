using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SupplySync.API.DTOs.Compliance;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class ComplianceService : IComplianceService
{
    private readonly IComplianceRepository _complianceRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public ComplianceService(
        IComplianceRepository complianceRepo,
        IGenericRepository<Notification> notificationRepo,
        UserManager<ApplicationUser> userManager,
        IMapper mapper)
    {
        _complianceRepo = complianceRepo;
        _notificationRepo = notificationRepo;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ComplianceCheckDto>> GetAllChecksAsync()
    {
        var checks = await _complianceRepo.GetAllAsync();
        return _mapper.Map<IEnumerable<ComplianceCheckDto>>(checks);
    }

    public async Task<IEnumerable<ComplianceCheckDto>> GetByEntityAsync(
        string entityType, int entityId)
    {
        var checks = await _complianceRepo.GetByEntityAsync(entityType, entityId);
        return _mapper.Map<IEnumerable<ComplianceCheckDto>>(checks);
    }

    public async Task<IEnumerable<ComplianceCheckDto>> GetFailedChecksAsync()
    {
        var checks = await _complianceRepo.GetFailedChecksAsync();
        return _mapper.Map<IEnumerable<ComplianceCheckDto>>(checks);
    }

    public async Task<(bool Success, string Message, ComplianceCheckDto? Data)> PerformCheckAsync(
        CreateComplianceCheckDto dto, string checkedByUserId)
    {
        if (!Enum.TryParse<ComplianceStatus>(dto.Status, out var status))
            return (false, "Invalid status. Use Pass or Fail.", null);

        var check = new ComplianceCheck
        {
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            Status = status,
            Remarks = dto.Remarks,
            CheckedByUserId = checkedByUserId,
            CheckedAt = DateTime.UtcNow
        };

        await _complianceRepo.AddAsync(check);

        // If failed — notify Admin and Procurement Officers
        if (status == ComplianceStatus.Fail)
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            var procurements = await _userManager.GetUsersInRoleAsync("ProcurementOfficer");
            var usersToNotify = admins.Concat(procurements);

            foreach (var user in usersToNotify)
            {
                await _notificationRepo.AddAsync(new Notification
                {
                    UserId = user.Id,
                    Message = $"Compliance FAILED for {dto.EntityType} ID {dto.EntityId}. " +
                              $"Remarks: {dto.Remarks}",
                    Type = "ComplianceFail"
                });
            }
        }

        await _complianceRepo.SaveAsync();
        return (true, "Compliance check recorded.", _mapper.Map<ComplianceCheckDto>(check));
    }
}