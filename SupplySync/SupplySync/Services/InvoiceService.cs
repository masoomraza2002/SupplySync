using AutoMapper;
using SupplySync.API.DTOs.Invoice;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;
using Microsoft.AspNetCore.Identity;

namespace SupplySync.API.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepo;
    private readonly IGenericRepository<Payment> _paymentRepo;
    private readonly IVendorRepository _vendorRepo;
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly IGoodsReceiptRepository _grRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public InvoiceService(
        IInvoiceRepository invoiceRepo,
        IGenericRepository<Payment> paymentRepo,
        IVendorRepository vendorRepo,
        IPurchaseOrderRepository poRepo,
        IGoodsReceiptRepository grRepo,
        IGenericRepository<Notification> notificationRepo,
        UserManager<ApplicationUser> userManager,
        IMapper mapper)
    {
        _invoiceRepo = invoiceRepo;
        _paymentRepo = paymentRepo;
        _vendorRepo = vendorRepo;
        _poRepo = poRepo;
        _grRepo = grRepo;
        _notificationRepo = notificationRepo;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync()
    {
        var invoices = await _invoiceRepo.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
    }

    public async Task<InvoiceDto?> GetInvoiceByIdAsync(int id)
    {
        var invoice = await _invoiceRepo.GetInvoiceWithDetailsAsync(id);
        return invoice == null ? null : _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<IEnumerable<InvoiceDto>> GetInvoicesByVendorAsync(int vendorId)
    {
        var invoices = await _invoiceRepo.GetByVendorIdAsync(vendorId);
        return _mapper.Map<IEnumerable<InvoiceDto>>(invoices);
    }

    public async Task<(bool Success, string Message, InvoiceDto? Data)> SubmitInvoiceAsync(
        CreateInvoiceDto dto, string vendorUserId)
    {
        // Get vendor by user id
        var vendor = await _vendorRepo.GetByUserIdAsync(vendorUserId);
        if (vendor == null) return (false, "Vendor profile not found.", null);

        // Validate PO exists
        var po = await _poRepo.GetPOWithDetailsAsync(dto.PurchaseOrderId);
        if (po == null) return (false, "Purchase Order not found.", null);
        if (po.VendorId != vendor.Id)
            return (false, "This PO does not belong to your vendor account.", null);

        // Validate GR exists
        var gr = await _grRepo.GetGRWithDetailsAsync(dto.GoodsReceiptId);
        if (gr == null) return (false, "Goods Receipt not found.", null);
        if (gr.PurchaseOrderId != dto.PurchaseOrderId)
            return (false, "Goods Receipt does not match the Purchase Order.", null);

        // Duplicate check
        var isDuplicate = await _invoiceRepo.IsDuplicateInvoiceAsync(
            dto.PurchaseOrderId, dto.GoodsReceiptId);
        if (isDuplicate)
            return (false, "An invoice for this PO and Goods Receipt already exists.", null);

        var invoiceNumber = "INV-" + DateTime.UtcNow.Ticks.ToString()[^8..];

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            VendorId = vendor.Id,
            PurchaseOrderId = dto.PurchaseOrderId,
            GoodsReceiptId = dto.GoodsReceiptId,
            TotalAmount = dto.TotalAmount,
            Status = InvoiceStatus.Submitted,
            SubmittedAt = DateTime.UtcNow
        };

        await _invoiceRepo.AddAsync(invoice);

        // Notify Finance Officer
        // Notify all Finance Officers
        var financeUsers = await _userManager.GetUsersInRoleAsync("FinanceOfficer");
        foreach (var financeUser in financeUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                UserId = financeUser.Id,
                Message = $"New invoice {invoiceNumber} submitted by {vendor.CompanyName} " +
                          $"for PO {po.PONumber}. Amount: {dto.TotalAmount:C}",
                Type = "InvoiceSubmitted"
            });
        }

        await _invoiceRepo.SaveAsync();

        var result = await _invoiceRepo.GetInvoiceWithDetailsAsync(invoice.Id);
        return (true, "Invoice submitted successfully.", _mapper.Map<InvoiceDto>(result));
    }

    public async Task<(bool Success, string Message)> ReviewInvoiceAsync(
    int id, InvoiceReviewDto dto, string reviewedByUserId)
    {
        var invoice = await _invoiceRepo.GetInvoiceWithDetailsAsync(id);
        if (invoice == null) return (false, "Invoice not found.");
        if (invoice.Status != InvoiceStatus.Submitted)
            return (false, "Only submitted invoices can be reviewed.");

        // ── Check GR is Accepted ──────────────────────────────
        var gr = invoice.GoodsReceipt;
        if (gr == null)
            return (false, "No Goods Receipt linked to this invoice.");

        if (gr.Status == GoodsReceiptStatus.Rejected)
            return (false, "Cannot approve invoice. " +
                           "Warehouse Manager rejected the delivery.");

        if (gr.Status != GoodsReceiptStatus.Accepted)
            return (false, "Cannot approve invoice. " +
                           "Warehouse Manager has not verified the delivery yet.");
        // ─────────────────────────────────────────────────────

        if (!Enum.TryParse<InvoiceStatus>(dto.Status, out var status))
            return (false, "Invalid status. Use Approved or Rejected.");

        invoice.Status = status;
        invoice.RejectionReason = dto.RejectionReason;
        invoice.ReviewedAt = DateTime.UtcNow;
        invoice.ReviewedByUserId = reviewedByUserId;
        _invoiceRepo.Update(invoice);

        var message = status == InvoiceStatus.Approved
            ? $"Your invoice {invoice.InvoiceNumber} has been approved."
            : $"Your invoice {invoice.InvoiceNumber} has been rejected. " +
              $"Reason: {dto.RejectionReason}";

        await _notificationRepo.AddAsync(new Notification
        {
            UserId = invoice.Vendor.UserId,
            Message = message,
            Type = "InvoiceReviewed"
        });

        await _invoiceRepo.SaveAsync();
        return (true, $"Invoice {dto.Status} successfully.");
    }

    public async Task<(bool Success, string Message)> ProcessPaymentAsync(
        CreatePaymentDto dto, string processedByUserId)
    {
        var invoice = await _invoiceRepo.GetInvoiceWithDetailsAsync(dto.InvoiceId);
        if (invoice == null) return (false, "Invoice not found.");
        if (invoice.Status != InvoiceStatus.Approved)
            return (false, "Only approved invoices can be paid.");
        if (invoice.Payment != null)
            return (false, "Payment already processed for this invoice.");

        var payment = new Payment
        {
            InvoiceId = dto.InvoiceId,
            AmountPaid = dto.AmountPaid,
            PaymentReference = dto.PaymentReference,
            PaymentDate = DateTime.UtcNow,
            ProcessedByUserId = processedByUserId
        };

        await _paymentRepo.AddAsync(payment);

        // Notify vendor
        await _notificationRepo.AddAsync(new Notification
        {
            UserId = invoice.Vendor.UserId,
            Message = $"Payment of {dto.AmountPaid:C} has been processed for invoice " +
                      $"{invoice.InvoiceNumber}. Reference: {dto.PaymentReference}",
            Type = "PaymentProcessed"
        });

        await _paymentRepo.SaveAsync();
        return (true, "Payment processed successfully.");
    }
}