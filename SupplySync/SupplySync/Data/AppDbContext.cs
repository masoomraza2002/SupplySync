using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SupplySync.API.Models;
using System.Reflection.Emit;

namespace SupplySync.API.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<POItem> POItems => Set<POItem>();
    public DbSet<GoodsReceipt> GoodsReceipts => Set<GoodsReceipt>();
    public DbSet<GoodsReceiptItem> GoodsReceiptItems => Set<GoodsReceiptItem>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<ItemIssue> ItemIssues => Set<ItemIssue>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ComplianceCheck> ComplianceChecks => Set<ComplianceCheck>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Decimal precision
        builder.Entity<POItem>()
            .Property(p => p.UnitPrice)
            .HasPrecision(18, 2);

        builder.Entity<Invoice>()
            .Property(i => i.TotalAmount)
            .HasPrecision(18, 2);

        builder.Entity<Payment>()
            .Property(p => p.AmountPaid)
            .HasPrecision(18, 2);

        // One-to-one Payment <-> Invoice
        builder.Entity<Payment>()
            .HasOne(p => p.Invoice)
            .WithOne(i => i.Payment)
            .HasForeignKey<Payment>(p => p.InvoiceId);

        // Fix cascade paths on PurchaseOrder
        builder.Entity<PurchaseOrder>()
            .HasOne(p => p.Vendor)
            .WithMany(v => v.PurchaseOrders)
            .HasForeignKey(p => p.VendorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<PurchaseOrder>()
            .HasOne(p => p.Contract)
            .WithMany(c => c.PurchaseOrders)
            .HasForeignKey(p => p.ContractId)
            .OnDelete(DeleteBehavior.NoAction);

        // Fix cascade paths on Invoice
        builder.Entity<Invoice>()
            .HasOne(i => i.Vendor)
            .WithMany(v => v.Invoices)
            .HasForeignKey(i => i.VendorId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Invoice>()
            .HasOne(i => i.PurchaseOrder)
            .WithMany(p => p.Invoices)
            .HasForeignKey(i => i.PurchaseOrderId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Invoice>()
            .HasOne(i => i.GoodsReceipt)
            .WithMany()
            .HasForeignKey(i => i.GoodsReceiptId)
            .OnDelete(DeleteBehavior.NoAction);

        // Fix cascade paths on GoodsReceipt
        builder.Entity<GoodsReceipt>()
            .HasOne(g => g.PurchaseOrder)
            .WithMany(p => p.GoodsReceipts)
            .HasForeignKey(g => g.PurchaseOrderId)
            .OnDelete(DeleteBehavior.NoAction);

        // Fix cascade paths on Contract
        builder.Entity<Contract>()
            .HasOne(c => c.Vendor)
            .WithMany(v => v.Contracts)
            .HasForeignKey(c => c.VendorId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}