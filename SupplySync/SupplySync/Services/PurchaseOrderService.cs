using AutoMapper;
using SupplySync.API.DTOs.PurchaseOrder;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class PurchaseOrderService : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository _poRepo;
    private readonly IContractRepository _contractRepo;
    private readonly IVendorRepository _vendorRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IMapper _mapper;

    public PurchaseOrderService(
        IPurchaseOrderRepository poRepo,
        IContractRepository contractRepo,
        IVendorRepository vendorRepo,
        IGenericRepository<Notification> notificationRepo,
        IMapper mapper)
    {
        _poRepo = poRepo;
        _contractRepo = contractRepo;
        _vendorRepo = vendorRepo;
        _notificationRepo = notificationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetAllPOsAsync()
    {
        var pos = await _poRepo.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<PurchaseOrderDto>>(pos);
    }

    public async Task<PurchaseOrderDto?> GetPOByIdAsync(int id)
    {
        var po = await _poRepo.GetPOWithDetailsAsync(id);
        return po == null ? null : _mapper.Map<PurchaseOrderDto>(po);
    }

    public async Task<IEnumerable<PurchaseOrderDto>> GetPOsByVendorAsync(int vendorId)
    {
        var pos = await _poRepo.GetByVendorIdAsync(vendorId);
        return _mapper.Map<IEnumerable<PurchaseOrderDto>>(pos);
    }

    public async Task<(bool Success, string Message, PurchaseOrderDto? Data)> CreatePOAsync(
        CreatePurchaseOrderDto dto, string userId)
    {
        var contract = await _contractRepo.GetByIdAsync(dto.ContractId);
        if (contract == null) return (false, "Contract not found.", null);
        if (contract.Status != ContractStatus.Active)
            return (false, "An active contract is required to create a PO.", null);

        var vendor = await _vendorRepo.GetByIdAsync(dto.VendorId);
        if (vendor == null) return (false, "Vendor not found.", null);

        var poNumber = "PO-" + DateTime.UtcNow.Ticks.ToString()[^8..];

        var po = new PurchaseOrder
        {
            PONumber = poNumber,
            VendorId = dto.VendorId,
            ContractId = dto.ContractId,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
            Status = POStatus.Created,
            CreatedByUserId = userId,
            Items = dto.Items.Select(i => new POItem
            {
                ItemName = i.ItemName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        await _poRepo.AddAsync(po);

        // Notify vendor
        await _notificationRepo.AddAsync(new Notification
        {
            UserId = vendor.UserId,
            Message = $"A new Purchase Order {poNumber} has been issued to you.",
            Type = "POCreated"
        });

        await _poRepo.SaveAsync();

        // Update status to Sent
        po.Status = POStatus.Sent;
        _poRepo.Update(po);
        await _poRepo.SaveAsync();

        var result = await _poRepo.GetPOWithDetailsAsync(po.Id);
        return (true, "Purchase Order created and sent to vendor.", _mapper.Map<PurchaseOrderDto>(result));
    }

    public async Task<(bool Success, string Message)> UpdatePOStatusAsync(int id, string status)
    {
        var po = await _poRepo.GetByIdAsync(id);
        if (po == null) return (false, "Purchase Order not found.");

        if (!Enum.TryParse<POStatus>(status, out var poStatus))
            return (false, "Invalid status.");

        po.Status = poStatus;
        _poRepo.Update(po);
        await _poRepo.SaveAsync();
        return (true, $"PO status updated to {status}.");
    }

    public async Task<(bool Success, string Message)> CancelPOAsync(int id)
    {
        var po = await _poRepo.GetByIdAsync(id);
        if (po == null) return (false, "Purchase Order not found.");
        if (po.Status == POStatus.Delivered)
            return (false, "Cannot cancel a delivered PO.");

        po.Status = POStatus.Cancelled;
        _poRepo.Update(po);
        await _poRepo.SaveAsync();
        return (true, "Purchase Order cancelled.");
    }
}