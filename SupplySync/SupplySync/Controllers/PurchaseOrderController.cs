using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.PurchaseOrder;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseOrderController : ControllerBase
{
    private readonly IPurchaseOrderService _poService;

    public PurchaseOrderController(IPurchaseOrderService poService)
    {
        _poService = poService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,ProcurementOfficer,WarehouseManager,ComplianceOfficer,FinanceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var pos = await _poService.GetAllPOsAsync();
        return Ok(pos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var po = await _poService.GetPOByIdAsync(id);
        if (po == null) return NotFound();
        return Ok(po);
    }

    [HttpGet("vendor/{vendorId}")]
    [Authorize(Roles = "Vendor,ProcurementOfficer,Admin")]
    public async Task<IActionResult> GetByVendor(int vendorId)
    {
        var pos = await _poService.GetPOsByVendorAsync(vendorId);
        return Ok(pos);
    }

    [HttpPost]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message, data) = await _poService.CreatePOAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Vendor,ProcurementOfficer")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var (success, message) = await _poService.UpdatePOStatusAsync(id, status);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> Cancel(int id)
    {
        var (success, message) = await _poService.CancelPOAsync(id);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }
}