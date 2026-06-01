using AutoMapper;
using SupplySync.API.DTOs.Contract;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class ContractService : IContractService
{
    private readonly IContractRepository _contractRepo;
    private readonly IVendorRepository _vendorRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IMapper _mapper;

    public ContractService(
        IContractRepository contractRepo,
        IVendorRepository vendorRepo,
        IGenericRepository<Notification> notificationRepo,
        IMapper mapper)
    {
        _contractRepo = contractRepo;
        _vendorRepo = vendorRepo;
        _notificationRepo = notificationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ContractDto>> GetAllContractsAsync()
    {
        var contracts = await _contractRepo.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<ContractDto>>(contracts);
    }

    public async Task<ContractDto?> GetContractByIdAsync(int id)
    {
        var contract = await _contractRepo.GetContractWithDetailsAsync(id);
        return contract == null ? null : _mapper.Map<ContractDto>(contract);
    }

    public async Task<IEnumerable<ContractDto>> GetContractsByVendorAsync(int vendorId)
    {
        var contracts = await _contractRepo.GetByVendorIdAsync(vendorId);
        return _mapper.Map<IEnumerable<ContractDto>>(contracts);
    }

    public async Task<(bool Success, string Message, ContractDto? Data)> CreateContractAsync(
        CreateContractDto dto, string userId)
    {
        var vendor = await _vendorRepo.GetByIdAsync(dto.VendorId);
        if (vendor == null) return (false, "Vendor not found.", null);
        if (vendor.Status != VendorStatus.Approved)
            return (false, "Vendor must be approved before creating a contract.", null);

        var contractNumber = "CON-" + DateTime.UtcNow.Ticks.ToString()[^8..];

        var contract = new Contract
        {
            ContractNumber = contractNumber,
            VendorId = dto.VendorId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            PaymentTerms = dto.PaymentTerms,
            DeliveryTerms = dto.DeliveryTerms,
            ItemPricing = dto.ItemPricing,
            Status = ContractStatus.Draft,
            CreatedByUserId = userId
        };

        await _contractRepo.AddAsync(contract);

        // Notify vendor
        await _notificationRepo.AddAsync(new Notification
        {
            UserId = vendor.UserId,
            Message = $"A new contract {contractNumber} has been created for your account.",
            Type = "ContractCreated"
        });

        await _contractRepo.SaveAsync();

        var result = await _contractRepo.GetContractWithDetailsAsync(contract.Id);
        return (true, "Contract created successfully.", _mapper.Map<ContractDto>(result));
    }

    public async Task<(bool Success, string Message)> ActivateContractAsync(int id)
    {
        var contract = await _contractRepo.GetByIdAsync(id);
        if (contract == null) return (false, "Contract not found.");
        if (contract.Status != ContractStatus.Draft)
            return (false, "Only draft contracts can be activated.");

        contract.Status = ContractStatus.Active;
        _contractRepo.Update(contract);
        await _contractRepo.SaveAsync();
        return (true, "Contract activated successfully.");
    }

    public async Task<(bool Success, string Message)> CloseContractAsync(int id)
    {
        var contract = await _contractRepo.GetByIdAsync(id);
        if (contract == null) return (false, "Contract not found.");

        contract.Status = ContractStatus.Closed;
        _contractRepo.Update(contract);
        await _contractRepo.SaveAsync();
        return (true, "Contract closed successfully.");
    }
}