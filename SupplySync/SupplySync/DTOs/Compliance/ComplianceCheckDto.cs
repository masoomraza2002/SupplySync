namespace SupplySync.API.DTOs.Compliance;

public class ComplianceCheckDto
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; }
}