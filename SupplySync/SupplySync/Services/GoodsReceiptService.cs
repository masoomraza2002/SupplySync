using AutoMapper;
using SupplySync.API.DTOs.GoodsReceipt;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class GoodsReceiptService : IGoodsReceiptService
{
    private readonly IGoodsReceiptRepository _grRepo;
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly IInventoryRepository _inventoryRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IMapper _mapper;

    public GoodsReceiptService(
        IGoodsReceiptRepository grRepo,
        IPurchaseOrderRepository poRepo,
        IInventoryRepository inventoryRepo,
        IGenericRepository<Notification> notificationRepo,
        IMapper mapper)
    {
        _grRepo = grRepo;
        _poRepo = poRepo;
        _inventoryRepo = inventoryRepo;
        _notificationRepo = notificationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<GoodsReceiptDto>> GetAllAsync()
    {
        var receipts = await _grRepo.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<GoodsReceiptDto>>(receipts);
    }

    public async Task<GoodsReceiptDto?> GetByIdAsync(int id)
    {
        var gr = await _grRepo.GetGRWithDetailsAsync(id);
        return gr == null ? null : _mapper.Map<GoodsReceiptDto>(gr);
    }

    public async Task<IEnumerable<GoodsReceiptDto>> GetByPOIdAsync(int poId)
    {
        var receipts = await _grRepo.GetByPOIdAsync(poId);
        return _mapper.Map<IEnumerable<GoodsReceiptDto>>(receipts);
    }

    public async Task<(bool Success, string Message, GoodsReceiptDto? Data)> CreateGoodsReceiptAsync(
        CreateGoodsReceiptDto dto, string userId)
    {
        var po = await _poRepo.GetPOWithDetailsAsync(dto.PurchaseOrderId);
        if (po == null) return (false, "Purchase Order not found.", null);
        if (po.Status != POStatus.Delivered)
            return (false, "Cannot receive goods. Vendor has not marked this PO as Delivered yet.", null);

        // ── Prevent duplicate GR for same PO ──────────────────
        var existingGR = await _grRepo.FindAsync(g =>
    g.PurchaseOrderId == dto.PurchaseOrderId);
        if (existingGR.Any(g => g.Status != GoodsReceiptStatus.Rejected))
            return (false, "Goods Receipt already exists for this Purchase Order. " +
                           "Cannot receive the same PO twice.", null);

        if (!Enum.TryParse<GoodsReceiptStatus>(dto.Status, out var grStatus))
            return (false, "Invalid goods receipt status.", null);

        var grNumber = "GR-" + DateTime.UtcNow.Ticks.ToString()[^8..];

        var gr = new GoodsReceipt
        {
            GRNumber = grNumber,
            PurchaseOrderId = dto.PurchaseOrderId,
            Remarks = dto.Remarks,
            Status = grStatus,
            ReceivedByUserId = userId,
            ReceivedDate = DateTime.UtcNow,
            Items = dto.Items.Select(i => new GoodsReceiptItem
            {
                ItemName = i.ItemName,
                ReceivedQuantity = i.ReceivedQuantity,
                Condition = i.Condition
            }).ToList()
        };

        await _grRepo.AddAsync(gr);

        // Update PO status to Delivered
        // Only keep Delivered if goods were accepted; revert to Sent if rejected
        if (grStatus != GoodsReceiptStatus.Rejected)
        {
            po.Status = POStatus.Delivered;
            _poRepo.Update(po);
        }
        else
        {
            po.Status = POStatus.Sent;
            _poRepo.Update(po);
        }

        // Update inventory for accepted items
        if (grStatus == GoodsReceiptStatus.Accepted ||
            grStatus == GoodsReceiptStatus.PartiallyAccepted)
        {
            foreach (var item in dto.Items.Where(i =>
                i.Condition.Equals("Good", StringComparison.OrdinalIgnoreCase)))
            {
                var existing = await _inventoryRepo.GetByNameAsync(item.ItemName);
                if (existing != null)
                {
                    existing.QuantityInStock += item.ReceivedQuantity;
                    existing.LastUpdated = DateTime.UtcNow;
                    _inventoryRepo.Update(existing);
                }
                else
                {
                    await _inventoryRepo.AddAsync(new InventoryItem
                    {
                        ItemName = item.ItemName,
                        SKU = "SKU-" + DateTime.UtcNow.Ticks.ToString()[^6..],
                        QuantityInStock = item.ReceivedQuantity,
                        Unit = "Units",
                        LastUpdated = DateTime.UtcNow
                    });
                }
            }
        }

        // Notify Procurement Officer if items rejected
        if (grStatus == GoodsReceiptStatus.Rejected ||
            grStatus == GoodsReceiptStatus.PartiallyAccepted)
        {
            var procurementNotification = new Notification
            {
                UserId = po.CreatedByUserId,
                Message = $"Goods Receipt {grNumber} for PO {po.PONumber} has issues. " +
                          $"Status: {grStatus}. Remarks: {dto.Remarks}",
                Type = "GoodsReceiptIssue"
            };
            await _notificationRepo.AddAsync(procurementNotification);
        }

        // Notify vendor
        var vendorNotification = new Notification
        {
            UserId = po.Vendor.UserId,
            Message = $"Your delivery for PO {po.PONumber} has been received. " +
                      $"Status: {grStatus}.",
            Type = "GoodsReceived"
        };
        await _notificationRepo.AddAsync(vendorNotification);

        await _grRepo.SaveAsync();

        var result = await _grRepo.GetGRWithDetailsAsync(gr.Id);
        return (true, "Goods receipt created successfully.", _mapper.Map<GoodsReceiptDto>(result));
    }
}