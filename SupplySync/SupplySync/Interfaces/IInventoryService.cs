using SupplySync.API.DTOs.Inventory;

namespace SupplySync.API.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryItemDto>> GetAllItemsAsync();
    Task<InventoryItemDto?> GetItemByIdAsync(int id);
    Task<(bool Success, string Message, InventoryItemDto? Data)> CreateItemAsync(
        CreateInventoryItemDto dto);
    Task<(bool Success, string Message)> IssueItemAsync(
        IssueItemDto dto, string issuedByUserId);
    Task<IEnumerable<ItemIssueDto>> GetAllIssuesAsync();
    Task<IEnumerable<ItemIssueDto>> GetIssuesByItemAsync(int itemId);
}