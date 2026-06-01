const statusMap = {
  Pending:    "badge-pending",
  Approved:   "badge-approved",
  Rejected:   "badge-rejected",
  Active:     "badge-active",
  Draft:      "badge-draft",
  Closed:     "badge-closed",
  Delivered:  "badge-delivered",
  Suspended:  "badge-suspended",
  Created:    "badge-draft",
  Sent:       "badge-active",
  Cancelled:  "badge-rejected",
  Submitted:  "badge-pending",
  Pass:       "badge-approved",
  Fail:       "badge-rejected",
  Accepted:   "badge-approved",
};

const Badge = ({ status }) => (
  <span className={statusMap[status] ?? "badge-draft"}>
    {status}
  </span>
);

export default Badge;
