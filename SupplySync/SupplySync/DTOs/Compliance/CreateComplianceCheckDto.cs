namespace SupplySync.API.DTOs.Compliance;

public class CreateComplianceCheckDto
{
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Status { get; set; } = string.Empty; // Pass / Fail
    public string Remarks { get; set; } = string.Empty;
}