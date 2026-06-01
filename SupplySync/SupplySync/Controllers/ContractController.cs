using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.Contract;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractController : ControllerBase
{
    private readonly IContractService _contractService;

    public ContractController(IContractService contractService)
    {
        _contractService = contractService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,ProcurementOfficer,ComplianceOfficer,FinanceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var contracts = await _contractService.GetAllContractsAsync();
        return Ok(contracts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        if (contract == null) return NotFound();
        return Ok(contract);
    }

    [HttpGet("vendor/{vendorId}")]
    public async Task<IActionResult> GetByVendor(int vendorId)
    {
        var contracts = await _contractService.GetContractsByVendorAsync(vendorId);
        return Ok(contracts);
    }

    [HttpPost]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> Create([FromBody] CreateContractDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message, data) = await _contractService.CreateContractAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpPut("{id}/activate")]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> Activate(int id)
    {
        var (success, message) = await _contractService.ActivateContractAsync(id);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpPut("{id}/close")]
    [Authorize(Roles = "ProcurementOfficer")]
    public async Task<IActionResult> Close(int id)
    {
        var (success, message) = await _contractService.CloseContractAsync(id);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }
}