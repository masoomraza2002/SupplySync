using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.Inventory;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseManager,ProcurementOfficer,ComplianceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryService.GetAllItemsAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseManager,ProcurementOfficer,ComplianceOfficer")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _inventoryService.GetItemByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    [Authorize(Roles = "WarehouseManager")]
    public async Task<IActionResult> Create([FromBody] CreateInventoryItemDto dto)
    {
        var (success, message, data) = await _inventoryService.CreateItemAsync(dto);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpPost("issue")]
    [Authorize(Roles = "WarehouseManager")]
    public async Task<IActionResult> IssueItem([FromBody] IssueItemDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message) = await _inventoryService.IssueItemAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpGet("issues")]
    [Authorize(Roles = "Admin,WarehouseManager,ComplianceOfficer")]
    public async Task<IActionResult> GetAllIssues()
    {
        var issues = await _inventoryService.GetAllIssuesAsync();
        return Ok(issues);
    }

    [HttpGet("{id}/issues")]
    [Authorize(Roles = "Admin,WarehouseManager,ComplianceOfficer")]
    public async Task<IActionResult> GetIssuesByItem(int id)
    {
        var issues = await _inventoryService.GetIssuesByItemAsync(id);
        return Ok(issues);
    }
}