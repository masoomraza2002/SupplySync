using SupplySync.API.DTOs.Notification;

namespace SupplySync.API.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task<(bool Success, string Message)> MarkAsReadAsync(int id, string userId);
    Task MarkAllAsReadAsync(string userId);
}