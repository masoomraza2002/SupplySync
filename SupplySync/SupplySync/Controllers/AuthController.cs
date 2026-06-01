using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SupplySync.API.Data;
using SupplySync.API.DTOs.Auth;
using SupplySync.API.Helpers;
using SupplySync.API.Models;

namespace SupplySync.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtHelper _jwtHelper;
    private readonly AppDbContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtHelper jwtHelper,
        AppDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtHelper = jwtHelper;
        _context = context;
    }

    // Admin creates internal users
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, dto.Role);
        return Ok(new { message = "User created successfully" });
    }

    // Vendor self-registration
    [HttpPost("vendor-register")]
    public async Task<IActionResult> VendorRegister([FromBody] VendorRegisterDto dto)
    {
        var user = new ApplicationUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, "Vendor");

        // Generate vendor code
        var vendorCode = "VEN-" + DateTime.UtcNow.Ticks.ToString()[^6..];

        var vendor = new Vendor
        {
            VendorCode = vendorCode,
            CompanyName = dto.CompanyName,
            ContactEmail = dto.Email,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            TaxNumber = dto.TaxNumber,
            LicenseNumber = dto.LicenseNumber,
            DocumentPath = dto.DocumentPath,
            Status = VendorStatus.Pending,
            UserId = user.Id
        };

        _context.Vendors.Add(vendor);

        // Notify procurement officers
        var procurementUsers = await _userManager.GetUsersInRoleAsync("ProcurementOfficer");
        foreach (var po in procurementUsers)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = po.Id,
                Message = $"New vendor {dto.CompanyName} has registered and is pending approval.",
                Type = "VendorRegistration"
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Vendor registered successfully. Awaiting approval." });
    }

    // Login for all roles
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !user.IsActive)
            return Unauthorized(new { message = "Invalid credentials or account inactive." });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid credentials." });

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtHelper.GenerateToken(user, roles);

        // Get vendorId if vendor
        int? vendorId = null;
        if (roles.Contains("Vendor"))
        {
            var vendor = _context.Vendors.FirstOrDefault(v => v.UserId == user.Id);
            vendorId = vendor?.Id;
        }

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? "",
            VendorId = vendorId
        });
    }
}