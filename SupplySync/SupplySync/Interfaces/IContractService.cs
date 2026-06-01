using SupplySync.API.DTOs.Contract;

namespace SupplySync.API.Interfaces;

public interface IContractService
{
    Task<IEnumerable<ContractDto>> GetAllContractsAsync();
    Task<ContractDto?> GetContractByIdAsync(int id);
    Task<IEnumerable<ContractDto>> GetContractsByVendorAsync(int vendorId);
    Task<(bool Success, string Message, ContractDto? Data)> CreateContractAsync(CreateContractDto dto, string userId);
    Task<(bool Success, string Message)> ActivateContractAsync(int id);
    Task<(bool Success, string Message)> CloseContractAsync(int id);
}