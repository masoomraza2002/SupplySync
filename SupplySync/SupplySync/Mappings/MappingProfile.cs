using AutoMapper;
using SupplySync.API.DTOs.Compliance;
using SupplySync.API.DTOs.Contract;
using SupplySync.API.DTOs.GoodsReceipt;
using SupplySync.API.DTOs.Inventory;
using SupplySync.API.DTOs.Invoice;
using SupplySync.API.DTOs.Notification;
using SupplySync.API.DTOs.PurchaseOrder;
using SupplySync.API.DTOs.Vendor;
using SupplySync.API.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SupplySync.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Vendor
        CreateMap<Vendor, VendorDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        // Contract
        CreateMap<Contract, ContractDto>()
            .ForMember(d => d.VendorName, o => o.MapFrom(s => s.Vendor.CompanyName))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<CreateContractDto, Contract>();

        // PurchaseOrder
        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(d => d.VendorName, o => o.MapFrom(s => s.Vendor.CompanyName))
            .ForMember(d => d.ContractNumber, o => o.MapFrom(s => s.Contract.ContractNumber))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<CreatePurchaseOrderDto, PurchaseOrder>();
        CreateMap<POItem, POItemDto>()
            .ForMember(d => d.TotalPrice, o => o.MapFrom(s => s.Quantity * s.UnitPrice));
        CreateMap<CreatePOItemDto, POItem>();

        // GoodsReceipt
        CreateMap<GoodsReceipt, GoodsReceiptDto>()
            .ForMember(d => d.PONumber, o => o.MapFrom(s => s.PurchaseOrder.PONumber))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<GoodsReceiptItem, GoodsReceiptItemDto>();

        // Inventory
        CreateMap<InventoryItem, InventoryItemDto>();
        CreateMap<CreateInventoryItemDto, InventoryItem>();
        CreateMap<ItemIssue, ItemIssueDto>()
            .ForMember(d => d.ItemName, o => o.MapFrom(s => s.InventoryItem.ItemName));

        // Invoice
        CreateMap<Invoice, InvoiceDto>()
    .ForMember(d => d.VendorName, o => o.MapFrom(s => s.Vendor.CompanyName))
    .ForMember(d => d.PONumber, o => o.MapFrom(s => s.PurchaseOrder.PONumber))
    .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
    .ForMember(d => d.IsPaid, o => o.MapFrom(s => s.Payment != null))
    .ForMember(d => d.PaymentReference,
        o => o.MapFrom(s => s.Payment != null ? s.Payment.PaymentReference : null))
    .ForMember(d => d.PaymentDate,
        o => o.MapFrom(s => s.Payment != null ? s.Payment.PaymentDate : (DateTime?)null));

        // Compliance
        CreateMap<ComplianceCheck, ComplianceCheckDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        // Notification
        CreateMap<Notification, NotificationDto>();
    }
}