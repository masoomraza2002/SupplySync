namespace SupplySync.API.DTOs.Invoice;

public class CreateInvoiceDto
{
    public int PurchaseOrderId { get; set; }
    public int GoodsReceiptId { get; set; }
    public decimal TotalAmount { get; set; }
}