using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.GoodsReceipt;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoodsReceiptController : ControllerBase
{
    private readonly IGoodsReceiptService _grService;

    public GoodsReceiptController(IGoodsReceiptService grService)
    {
        _grService = grService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseManager,ProcurementOfficer,ComplianceOfficer,FinanceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var receipts = await _grService.GetAllAsync();
        return Ok(receipts);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseManager,ProcurementOfficer,ComplianceOfficer,FinanceOfficer")]
    public async Task<IActionResult> GetById(int id)
    {
        var gr = await _grService.GetByIdAsync(id);
        if (gr == null) return NotFound();
        return Ok(gr);
    }

    [HttpGet("po/{poId}")]
    [Authorize(Roles = "Admin,WarehouseManager,ProcurementOfficer,ComplianceOfficer,FinanceOfficer,Vendor")]
    public async Task<IActionResult> GetByPO(int poId)
    {
        var receipts = await _grService.GetByPOIdAsync(poId);
        return Ok(receipts);
    }

    [HttpPost]
    [Authorize(Roles = "WarehouseManager")]
    public async Task<IActionResult> Create([FromBody] CreateGoodsReceiptDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message, data) = await _grService.CreateGoodsReceiptAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }
}