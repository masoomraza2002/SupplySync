using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SupplySync.API.DTOs.Vendor;
using SupplySync.API.Interfaces;
using SupplySync.API.Models;

namespace SupplySync.API.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepo;
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public VendorService(
        IVendorRepository vendorRepo,
        IGenericRepository<Notification> notificationRepo,
        UserManager<ApplicationUser> userManager,
        IMapper mapper)
    {
        _vendorRepo = vendorRepo;
        _notificationRepo = notificationRepo;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<IEnumerable<VendorDto>> GetAllVendorsAsync()
    {
        var vendors = await _vendorRepo.GetAllWithDetailsAsync();
        return _mapper.Map<IEnumerable<VendorDto>>(vendors);
    }

    public async Task<VendorDto?> GetVendorByIdAsync(int id)
    {
        var vendor = await _vendorRepo.GetVendorWithDetailsAsync(id);
        return vendor == null ? null : _mapper.Map<VendorDto>(vendor);
    }

    public async Task<VendorDto?> GetVendorByUserIdAsync(string userId)
    {
        var vendor = await _vendorRepo.GetByUserIdAsync(userId);
        return vendor == null ? null : _mapper.Map<VendorDto>(vendor);
    }

    public async Task<(bool Success, string Message)> UpdateVendorStatusAsync(
        int id, VendorStatusUpdateDto dto, string updatedByUserId)
    {
        var vendor = await _vendorRepo.GetByIdAsync(id);
        if (vendor == null) return (false, "Vendor not found.");

        if (!Enum.TryParse<VendorStatus>(dto.Status, out var status))
            return (false, "Invalid status value.");

        vendor.Status = status;
        vendor.RejectionReason = dto.RejectionReason;
        _vendorRepo.Update(vendor);

        // Notify vendor
        var message = status == VendorStatus.Approved
            ? "Your vendor account has been approved. You can now participate in procurement."
            : $"Your vendor account has been rejected. Reason: {dto.RejectionReason}";

        await _notificationRepo.AddAsync(new Notification
        {
            UserId = vendor.UserId,
            Message = message,
            Type = "VendorStatusUpdate"
        });

        await _vendorRepo.SaveAsync();
        return (true, $"Vendor status updated to {dto.Status}.");
    }

    public async Task<(bool Success, string Message)> SuspendVendorAsync(int id)
    {
        var vendor = await _vendorRepo.GetByIdAsync(id);
        if (vendor == null) return (false, "Vendor not found.");

        vendor.Status = VendorStatus.Suspended;
        _vendorRepo.Update(vendor);

        await _notificationRepo.AddAsync(new Notification
        {
            UserId = vendor.UserId,
            Message = "Your vendor account has been suspended. Please contact support.",
            Type = "VendorSuspended"
        });

        await _vendorRepo.SaveAsync();
        return (true, "Vendor suspended successfully.");
    }

    public async Task<(bool Success, string Message)> ReapplyAsync(
    string userId, VendorReapplyDto dto)
    {
        var vendor = await _vendorRepo.GetByUserIdAsync(userId);
        if (vendor == null) return (false, "Vendor not found.");
        if (vendor.Status != VendorStatus.Rejected)
            return (false, "Only rejected vendors can reapply.");

        vendor.TaxNumber = dto.TaxNumber;
        vendor.LicenseNumber = dto.LicenseNumber;
        vendor.DocumentPath = dto.DocumentPath;
        vendor.ContactPhone = dto.ContactPhone;
        vendor.Address = dto.Address;
        vendor.Status = VendorStatus.Pending;
        vendor.RejectionReason = null;
        _vendorRepo.Update(vendor);

        // Notify procurement officers
        var procurementUsers = await _userManager
            .GetUsersInRoleAsync("ProcurementOfficer");
        foreach (var po in procurementUsers)
        {
            await _notificationRepo.AddAsync(new Notification
            {
                UserId = po.Id,
                Message = $"Vendor {vendor.CompanyName} has reapplied " +
                          $"for approval.",
                Type = "VendorRegistration"
            });
        }

        await _vendorRepo.SaveAsync();
        return (true, "Reapplication submitted successfully.");
    }
}