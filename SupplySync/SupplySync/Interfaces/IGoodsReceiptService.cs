using SupplySync.API.DTOs.GoodsReceipt;

namespace SupplySync.API.Interfaces;

public interface IGoodsReceiptService
{
    Task<IEnumerable<GoodsReceiptDto>> GetAllAsync();
    Task<GoodsReceiptDto?> GetByIdAsync(int id);
    Task<IEnumerable<GoodsReceiptDto>> GetByPOIdAsync(int poId);
    Task<(bool Success, string Message, GoodsReceiptDto? Data)> CreateGoodsReceiptAsync(
        CreateGoodsReceiptDto dto, string userId);
}