using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.Compliance;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComplianceController : ControllerBase
{
    private readonly IComplianceService _complianceService;

    public ComplianceController(IComplianceService complianceService)
    {
        _complianceService = complianceService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,ComplianceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var checks = await _complianceService.GetAllChecksAsync();
        return Ok(checks);
    }

    [HttpGet("entity")]
    [Authorize(Roles = "Admin,ComplianceOfficer")]
    public async Task<IActionResult> GetByEntity(
        [FromQuery] string entityType, [FromQuery] int entityId)
    {
        var checks = await _complianceService.GetByEntityAsync(entityType, entityId);
        return Ok(checks);
    }

    [HttpGet("failed")]
    [Authorize(Roles = "Admin,ComplianceOfficer")]
    public async Task<IActionResult> GetFailed()
    {
        var checks = await _complianceService.GetFailedChecksAsync();
        return Ok(checks);
    }

    [HttpPost]
    [Authorize(Roles = "ComplianceOfficer")]
    public async Task<IActionResult> PerformCheck([FromBody] CreateComplianceCheckDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message, data) = await _complianceService.PerformCheckAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }
}