using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplySync.API.Data;
using SupplySync.API.Models;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // Vendor performance summary
    [HttpGet("vendor-performance")]
    [Authorize(Roles = "Admin,ProcurementOfficer,ComplianceOfficer")]
    public async Task<IActionResult> VendorPerformance()
    {
        var data = await _context.Vendors
            .Include(v => v.PurchaseOrders)
            .Include(v => v.Invoices)
            .Select(v => new
            {
                v.Id,
                v.CompanyName,
                v.Status,
                TotalPOs = v.PurchaseOrders.Count,
                DeliveredPOs = v.PurchaseOrders
                    .Count(p => p.Status == POStatus.Delivered),
                TotalInvoices = v.Invoices.Count,
                ApprovedInvoices = v.Invoices
                    .Count(i => i.Status == InvoiceStatus.Approved),
                TotalSpend = v.Invoices
                    .Where(i => i.Status == InvoiceStatus.Approved)
                    .Sum(i => i.TotalAmount)
            })
            .ToListAsync();

        return Ok(data);
    }

    // Inventory summary
    [HttpGet("inventory-summary")]
    [Authorize(Roles = "Admin,WarehouseManager,ComplianceOfficer")]
    public async Task<IActionResult> InventorySummary()
    {
        var data = await _context.InventoryItems
            .Select(i => new
            {
                i.Id,
                i.ItemName,
                i.SKU,
                i.QuantityInStock,
                i.Unit,
                i.LastUpdated,
                TotalIssued = i.Issues.Sum(iss => iss.QuantityIssued)
            })
            .ToListAsync();

        return Ok(data);
    }

    // Procurement spending
    [HttpGet("procurement-spending")]
    [Authorize(Roles = "Admin,FinanceOfficer,ProcurementOfficer")]
    public async Task<IActionResult> ProcurementSpending()
    {
        var data = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.PurchaseOrder)
            .Include(i => i.Payment)
            .Where(i => i.Status == InvoiceStatus.Approved)
            .Select(i => new
            {
                i.InvoiceNumber,
                VendorName = i.Vendor.CompanyName,
                PONumber = i.PurchaseOrder.PONumber,
                i.TotalAmount,
                i.SubmittedAt,
                PaymentDate = i.Payment != null
                    ? i.Payment.PaymentDate
                    : (DateTime?)null,
                PaymentReference = i.Payment != null
                    ? i.Payment.PaymentReference
                    : null
            })
            .ToListAsync();

        var total = data.Sum(d => d.TotalAmount);
        return Ok(new { total, records = data });
    }

    // Delivery delay report
    [HttpGet("delivery-delays")]
    [Authorize(Roles = "Admin,ProcurementOfficer,ComplianceOfficer")]
    public async Task<IActionResult> DeliveryDelays()
    {
        var data = await _context.PurchaseOrders
            .Include(p => p.Vendor)
            .Where(p =>
                p.Status != POStatus.Delivered &&
                p.Status != POStatus.Cancelled &&
                p.ExpectedDeliveryDate < DateTime.UtcNow)
            .Select(p => new
            {
                p.Id,
                p.PONumber,
                VendorName = p.Vendor.CompanyName,
                p.ExpectedDeliveryDate,
                p.Status,
                DaysDelayed = (int)(DateTime.UtcNow - p.ExpectedDeliveryDate).TotalDays
            })
            .ToListAsync();

        return Ok(data);
    }

    // Item issue report
    [HttpGet("item-issues")]
    [Authorize(Roles = "Admin,WarehouseManager,ComplianceOfficer")]
    public async Task<IActionResult> ItemIssues()
    {
        var data = await _context.ItemIssues
            .Include(i => i.InventoryItem)
            .Select(i => new
            {
                i.Id,
                ItemName = i.InventoryItem.ItemName,
                i.QuantityIssued,
                i.IssuedTo,
                i.IssueDate,
                i.Remarks
            })
            .OrderByDescending(i => i.IssueDate)
            .ToListAsync();

        return Ok(data);
    }

    // Compliance summary
    [HttpGet("compliance-summary")]
    [Authorize(Roles = "Admin,ComplianceOfficer")]
    public async Task<IActionResult> ComplianceSummary()
    {
        var data = await _context.ComplianceChecks
            .GroupBy(c => c.Status)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();

        var failed = await _context.ComplianceChecks
            .Where(c => c.Status == ComplianceStatus.Fail)
            .Select(c => new
            {
                c.EntityType,
                c.EntityId,
                c.Remarks,
                c.CheckedAt
            })
            .OrderByDescending(c => c.CheckedAt)
            .Take(10)
            .ToListAsync();

        return Ok(new { summary = data, recentFailures = failed });
    }
}