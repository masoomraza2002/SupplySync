using AutoMapper;
using SupplySync.API.DTOs.Notification;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class NotificationService : INotificationService
{
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IMapper _mapper;

    public NotificationService(
        IGenericRepository<Notification> notificationRepo,
        IMapper mapper)
    {
        _notificationRepo = notificationRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(string userId)
    {
        var notifications = await _notificationRepo
            .FindAsync(n => n.UserId == userId);
        return _mapper.Map<IEnumerable<NotificationDto>>(
            notifications.OrderByDescending(n => n.CreatedAt));
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var notifications = await _notificationRepo
            .FindAsync(n => n.UserId == userId && !n.IsRead);
        return notifications.Count();
    }

    public async Task<(bool Success, string Message)> MarkAsReadAsync(int id, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null) return (false, "Notification not found.");
        if (notification.UserId != userId)
            return (false, "Unauthorized.");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _notificationRepo.SaveAsync();
        return (true, "Notification marked as read.");
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var notifications = await _notificationRepo
            .FindAsync(n => n.UserId == userId && !n.IsRead);
        foreach (var n in notifications)
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }
        await _notificationRepo.SaveAsync();
    }
}