using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.Vendor;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,ProcurementOfficer,ComplianceOfficer,FinanceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var vendors = await _vendorService.GetAllVendorsAsync();
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,ProcurementOfficer,ComplianceOfficer,FinanceOfficer,Vendor")]
    public async Task<IActionResult> GetById(int id)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(id);
        if (vendor == null) return NotFound();
        return Ok(vendor);
    }

    [HttpPut("reapply")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> Reapply([FromBody] VendorReapplyDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message) = await _vendorService.ReapplyAsync(userId, dto);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpGet("my-profile")]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var vendor = await _vendorService.GetVendorByUserIdAsync(userId);
        if (vendor == null) return NotFound();
        return Ok(vendor);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] VendorStatusUpdateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message) = await _vendorService.UpdateVendorStatusAsync(id, dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpPut("{id}/suspend")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Suspend(int id)
    {
        var (success, message) = await _vendorService.SuspendVendorAsync(id);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }
}