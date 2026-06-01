using AutoMapper;
using SupplySync.API.DTOs.Inventory;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepo;
    private readonly IGenericRepository<ItemIssue> _issueRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IMapper _mapper;

    public InventoryService(
        IInventoryRepository inventoryRepo,
        IGenericRepository<ItemIssue> issueRepo,
        IGenericRepository<Notification> notificationRepo,
        IMapper mapper)
    {
        _inventoryRepo = inventoryRepo;
        _issueRepo = issueRepo;
        _notificationRepo = notificationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetAllItemsAsync()
    {
        var items = await _inventoryRepo.GetAllAsync();
        return _mapper.Map<IEnumerable<InventoryItemDto>>(items);
    }

    public async Task<InventoryItemDto?> GetItemByIdAsync(int id)
    {
        var item = await _inventoryRepo.GetByIdAsync(id);
        return item == null ? null : _mapper.Map<InventoryItemDto>(item);
    }

    public async Task<(bool Success, string Message, InventoryItemDto? Data)> CreateItemAsync(
        CreateInventoryItemDto dto)
    {
        var existing = await _inventoryRepo.GetByNameAsync(dto.ItemName);
        if (existing != null)
        {
            existing.QuantityInStock += dto.QuantityInStock;
            existing.LastUpdated = DateTime.UtcNow;
            _inventoryRepo.Update(existing);
            await _inventoryRepo.SaveAsync();
            return (true, "Inventory item updated.", _mapper.Map<InventoryItemDto>(existing));
        }

        var item = _mapper.Map<InventoryItem>(dto);
        item.LastUpdated = DateTime.UtcNow;
        await _inventoryRepo.AddAsync(item);
        await _inventoryRepo.SaveAsync();
        return (true, "Inventory item created.", _mapper.Map<InventoryItemDto>(item));
    }

    public async Task<(bool Success, string Message)> IssueItemAsync(
        IssueItemDto dto, string issuedByUserId)
    {
        var item = await _inventoryRepo.GetByIdAsync(dto.InventoryItemId);
        if (item == null) return (false, "Inventory item not found.");

        if (item.QuantityInStock < dto.QuantityIssued)
            return (false, $"Insufficient stock. Available: {item.QuantityInStock}");

        // Reduce stock
        item.QuantityInStock -= dto.QuantityIssued;
        item.LastUpdated = DateTime.UtcNow;
        _inventoryRepo.Update(item);

        // Record issue
        var issue = new ItemIssue
        {
            InventoryItemId = dto.InventoryItemId,
            QuantityIssued = dto.QuantityIssued,
            IssuedTo = dto.IssuedTo,
            IssueDate = dto.IssueDate,
            Remarks = dto.Remarks,
            IssuedByUserId = issuedByUserId
        };
        await _issueRepo.AddAsync(issue);

        // Low stock warning — notify warehouse manager
        if (item.QuantityInStock <= 10)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                UserId = issuedByUserId,
                Message = $"Low stock alert: {item.ItemName} has only " +
                          $"{item.QuantityInStock} {item.Unit} remaining.",
                Type = "LowStockAlert"
            });
        }

        await _inventoryRepo.SaveAsync();
        return (true, "Item issued successfully.");
    }

    public async Task<IEnumerable<ItemIssueDto>> GetAllIssuesAsync()
    {
        var issues = await _issueRepo.FindAsync(i => true);
        var issuesWithItems = new List<ItemIssue>();

        foreach (var issue in issues)
        {
            var item = await _inventoryRepo.GetByIdAsync(issue.InventoryItemId);
            issue.InventoryItem = item!;
            issuesWithItems.Add(issue);
        }

        return _mapper.Map<IEnumerable<ItemIssueDto>>(issuesWithItems);
    }

    public async Task<IEnumerable<ItemIssueDto>> GetIssuesByItemAsync(int itemId)
    {
        var item = await _inventoryRepo.GetWithIssuesAsync(itemId);
        if (item == null) return [];

        foreach (var issue in item.Issues)
            issue.InventoryItem = item;

        return _mapper.Map<IEnumerable<ItemIssueDto>>(item.Issues);
    }
}