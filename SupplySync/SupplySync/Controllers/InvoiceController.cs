using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.DTOs.Invoice;
using SupplySync.API.Interfaces;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,FinanceOfficer,ComplianceOfficer")]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _invoiceService.GetAllInvoicesAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,FinanceOfficer,ComplianceOfficer,Vendor")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpGet("vendor/{vendorId}")]
    [Authorize(Roles = "Admin,FinanceOfficer,Vendor")]
    public async Task<IActionResult> GetByVendor(int vendorId)
    {
        var invoices = await _invoiceService.GetInvoicesByVendorAsync(vendorId);
        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "Vendor")]
    public async Task<IActionResult> Submit([FromBody] CreateInvoiceDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message, data) = await _invoiceService.SubmitInvoiceAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message, data });
    }

    [HttpPut("{id}/review")]
    [Authorize(Roles = "FinanceOfficer")]
    public async Task<IActionResult> Review(int id, [FromBody] InvoiceReviewDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message) = await _invoiceService.ReviewInvoiceAsync(id, dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpPost("payment")]
    [Authorize(Roles = "FinanceOfficer")]
    public async Task<IActionResult> ProcessPayment([FromBody] CreatePaymentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var (success, message) = await _invoiceService.ProcessPaymentAsync(dto, userId);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }
}