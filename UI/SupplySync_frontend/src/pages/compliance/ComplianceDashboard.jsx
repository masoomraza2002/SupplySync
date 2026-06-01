import { useState, useEffect } from "react";
import { complianceApi } from "../../api/complianceApi";
import { vendorApi } from "../../api/vendorApi";
import { contractApi } from "../../api/contractApi";
import { purchaseOrderApi } from "../../api/purchaseOrderApi";
import { invoiceApi } from "../../api/invoiceApi";
import { inventoryApi } from "../../api/inventoryApi";
import { reportsApi } from "../../api/reportsApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ShieldCheck, ShieldAlert, ClipboardCheck,
  AlertTriangle, FileText, Truck,
  Warehouse, Receipt, Plus
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const entityTypes = [
  "Vendor", "Contract", "PurchaseOrder",
  "GoodsReceipt", "Invoice", "InventoryItem"
];

const ComplianceDashboard = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "overview");
  const [checks, setChecks] = useState([]);
  const [failedChecks, setFailedChecks] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [issues, setIssues] = useState([]);
  const [complianceSummary, setComplianceSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [checkModal, setCheckModal] = useState(false);
  const [checkForm, setCheckForm] = useState({
    entityType: "Vendor",
    entityId: 0,
    status: "Pass",
    remarks: "",
  });

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        checksRes, failedRes, vendorsRes,
        contractsRes, ordersRes, invoicesRes,
        issuesRes, summaryRes
      ] = await Promise.all([
        complianceApi.getAll(),
        complianceApi.getFailed(),
        vendorApi.getAll(),
        contractApi.getAll(),
        purchaseOrderApi.getAll(),
        invoiceApi.getAll(),
        inventoryApi.getAllIssues(),
        reportsApi.complianceSummary(),
      ]);
      setChecks(checksRes.data);
      setFailedChecks(failedRes.data);
      setVendors(vendorsRes.data);
      setContracts(contractsRes.data);
      setOrders(ordersRes.data);
      setInvoices(invoicesRes.data);
      setIssues(issuesRes.data);
      setComplianceSummary(summaryRes.data);
    } catch {
      toast.error("Failed to load compliance data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePerformCheck = async (e) => {
    e.preventDefault();
    if (!checkForm.entityId || !checkForm.remarks.trim()) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await complianceApi.performCheck(checkForm);
      toast.success("Compliance check recorded.");
      setCheckModal(false);
      setCheckForm({
        entityType: "Vendor",
        entityId: 0,
        status: "Pass",
        remarks: "",
      });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to record check.");
    }
  };

  const passCount = complianceSummary?.summary
    ?.find(s => s.status === "Pass")?.count ?? 0;
  const failCount = complianceSummary?.summary
    ?.find(s => s.status === "Fail")?.count ?? 0;
  const pendingCount = complianceSummary?.summary
    ?.find(s => s.status === "Pending")?.count ?? 0;

  const stats = [
    { title: "Total Checks", value: checks.length, icon: ClipboardCheck, color: "bg-primary-600" },
    { title: "Passed", value: passCount, icon: ShieldCheck, color: "bg-green-600" },
    { title: "Failed", value: failCount, icon: ShieldAlert, color: "bg-red-500" },
    { title: "Pending", value: pendingCount, icon: AlertTriangle, color: "bg-yellow-500" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: ShieldCheck },
    { key: "vendors", label: "Vendors", icon: Truck },
    { key: "contracts", label: "Contracts", icon: FileText },
    { key: "orders", label: "Purchase Orders", icon: ClipboardCheck },
    { key: "inventory", label: "Inventory Issues", icon: Warehouse },
    { key: "invoices", label: "Invoices", icon: Receipt },
    { key: "audit-log", label: "Audit Log", icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="page-title">Compliance Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Failed Checks Alert */}
      {failedChecks.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800 text-sm">
              {failedChecks.length} Compliance Failure
              {failedChecks.length !== 1 ? "s" : ""} Detected
            </p>
          </div>
          <div className="space-y-1">
            {failedChecks.slice(0, 3).map(f => (
              <p key={f.id} className="text-xs text-red-600">
                • {f.entityType} ID {f.entityId} — {f.remarks}
              </p>
            ))}
            {failedChecks.length > 3 && (
              <p className="text-xs text-red-400">
                +{failedChecks.length - 3} more failures. See Audit Log.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium
                        border-b-2 transition-colors duration-150
                        ${tab === key
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Perform Check Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCheckModal(true)}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Perform Compliance Check
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* ── Overview Tab ── */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Compliance Summary
                </h2>
                <div className="space-y-3">
                  {(complianceSummary?.summary ?? []).map(s => (
                    <div key={s.status}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {s.status === "Pass"
                          ? <ShieldCheck className="w-4 h-4 text-green-600" />
                          : s.status === "Fail"
                            ? <ShieldAlert className="w-4 h-4 text-red-500" />
                            : <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        }
                        <span className="text-sm font-medium text-gray-700">
                          {s.status}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {s.count}
                      </span>
                    </div>
                  ))}
                  {(complianceSummary?.summary ?? []).length === 0 && (
                    <p className="text-sm text-gray-400">
                      No compliance checks performed yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="card">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                  Recent Failures
                </h2>
                <div className="space-y-3">
                  {(complianceSummary?.recentFailures ?? []).map((f, i) => (
                    <div key={i}
                      className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-red-700">
                          {f.entityType} — ID {f.entityId}
                        </span>
                        <span className="text-xs text-red-400">
                          {new Date(f.checkedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-red-600">{f.remarks}</p>
                    </div>
                  ))}
                  {(complianceSummary?.recentFailures ?? []).length === 0 && (
                    <p className="text-sm text-gray-400">
                      No recent failures. 🎉
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Vendors Tab ── */}
          {tab === "vendors" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Code", "Company", "Email", "Tax No",
                        "License No", "Status", "Action"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendors.map(v => (
                      <tr key={v.id} className="table-row">
                        <td className="table-td font-mono text-xs">{v.vendorCode}</td>
                        <td className="table-td font-medium">{v.companyName}</td>
                        <td className="table-td text-gray-500 text-xs">{v.contactEmail}</td>
                        <td className="table-td text-gray-500">{v.taxNumber}</td>
                        <td className="table-td text-gray-500">{v.licenseNumber}</td>
                        <td className="table-td"><Badge status={v.status} /></td>
                        <td className="table-td">
                          <button
                            onClick={() => {
                              setCheckForm({ ...checkForm, entityType: "Vendor", entityId: v.id });
                              setCheckModal(true);
                            }}
                            className="text-xs btn-secondary py-1 px-2">
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Contracts Tab ── */}
          {tab === "contracts" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Contract No", "Vendor", "Start", "End",
                        "Status", "Action"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracts.map(c => (
                      <tr key={c.id} className="table-row">
                        <td className="table-td font-mono text-xs font-semibold">
                          {c.contractNumber}
                        </td>
                        <td className="table-td font-medium">{c.vendorName}</td>
                        <td className="table-td text-gray-500">
                          {new Date(c.startDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(c.endDate).toLocaleDateString()}
                        </td>
                        <td className="table-td"><Badge status={c.status} /></td>
                        <td className="table-td">
                          <button
                            onClick={() => {
                              setCheckForm({ ...checkForm, entityType: "Contract", entityId: c.id });
                              setCheckModal(true);
                            }}
                            className="text-xs btn-secondary py-1 px-2">
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Purchase Orders Tab ── */}
          {tab === "orders" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["PO Number", "Vendor", "Contract",
                        "Expected Delivery", "Status", "Action"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(o => (
                      <tr key={o.id} className="table-row">
                        <td className="table-td font-mono text-xs font-semibold">
                          {o.poNumber}
                        </td>
                        <td className="table-td font-medium">{o.vendorName}</td>
                        <td className="table-td font-mono text-xs text-gray-500">
                          {o.contractNumber}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(o.expectedDeliveryDate).toLocaleDateString()}
                        </td>
                        <td className="table-td"><Badge status={o.status} /></td>
                        <td className="table-td">
                          <button
                            onClick={() => {
                              setCheckForm({ ...checkForm, entityType: "PurchaseOrder", entityId: o.id });
                              setCheckModal(true);
                            }}
                            className="text-xs btn-secondary py-1 px-2">
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Inventory Issues Tab ── */}
          {tab === "inventory" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Item", "Qty Issued", "Issued To",
                        "Issue Date", "Remarks"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {issues.map(iss => (
                      <tr key={iss.id} className="table-row">
                        <td className="table-td font-medium">{iss.itemName}</td>
                        <td className="table-td font-semibold text-red-600">
                          -{iss.quantityIssued}
                        </td>
                        <td className="table-td text-gray-500">{iss.issuedTo}</td>
                        <td className="table-td text-gray-500">
                          {new Date(iss.issueDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          {iss.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr>
                        <td colSpan={5}
                          className="table-td text-center text-gray-400 py-8">
                          No item issues recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Invoices Tab ── */}
          {tab === "invoices" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Invoice No", "Vendor", "PO", "Amount",
                        "Status", "Submitted", "Action"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="table-row">
                        <td className="table-td font-mono text-xs font-semibold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="table-td font-medium">{inv.vendorName}</td>
                        <td className="table-td font-mono text-xs text-gray-500">
                          {inv.poNumber}
                        </td>
                        <td className="table-td font-semibold text-green-700">
                          ₹{inv.totalAmount.toFixed(2)}
                        </td>
                        <td className="table-td"><Badge status={inv.status} /></td>
                        <td className="table-td text-gray-500">
                          {new Date(inv.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="table-td">
                          <button
                            onClick={() => {
                              setCheckForm({ ...checkForm, entityType: "Invoice", entityId: inv.id });
                              setCheckModal(true);
                            }}
                            className="text-xs btn-secondary py-1 px-2">
                            Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Audit Log Tab ── */}
          {tab === "audit-log" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Entity Type", "Entity ID", "Status",
                        "Remarks", "Checked At"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {checks.map(c => (
                      <tr key={c.id} className="table-row">
                        <td className="table-td font-medium">{c.entityType}</td>
                        <td className="table-td text-gray-500">#{c.entityId}</td>
                        <td className="table-td"><Badge status={c.status} /></td>
                        <td className="table-td text-gray-600 max-w-xs truncate">
                          {c.remarks}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(c.checkedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {checks.length === 0 && (
                      <tr>
                        <td colSpan={5}
                          className="table-td text-center text-gray-400 py-8">
                          No compliance checks recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Perform Check Modal ── */}
      <Modal
        isOpen={checkModal}
        onClose={() => setCheckModal(false)}
        title="Perform Compliance Check"
        size="md">
        <form onSubmit={handlePerformCheck} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Entity Type</label>
              <select className="input-field"
                value={checkForm.entityType}
                onChange={e => setCheckForm({
                  ...checkForm, entityType: e.target.value
                })}>
                {entityTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Entity ID</label>
              <input type="number" min={1} className="input-field"
                placeholder="e.g. 1"
                value={checkForm.entityId || ""}
                onChange={e => setCheckForm({
                  ...checkForm, entityId: parseInt(e.target.value)
                })}
                required />
            </div>
          </div>

          <div>
            <label className="label">Compliance Result</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCheckForm({ ...checkForm, status: "Pass" })}
                className={`p-3 rounded-xl border-2 flex items-center
                            gap-2 text-sm font-medium transition-colors
                            ${checkForm.status === "Pass"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 text-gray-600"}`}>
                <ShieldCheck className="w-4 h-4" />
                Pass
              </button>
              <button
                type="button"
                onClick={() => setCheckForm({ ...checkForm, status: "Fail" })}
                className={`p-3 rounded-xl border-2 flex items-center
                            gap-2 text-sm font-medium transition-colors
                            ${checkForm.status === "Fail"
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 text-gray-600"}`}>
                <ShieldAlert className="w-4 h-4" />
                Fail
              </button>
            </div>
          </div>

          <div>
            <label className="label">Audit Remarks</label>
            <textarea className="input-field" rows={4}
              placeholder="Describe the compliance check findings..."
              value={checkForm.remarks}
              onChange={e => setCheckForm({
                ...checkForm, remarks: e.target.value
              })}
              required />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={`flex-1 ${checkForm.status === "Pass"
                ? "btn-success" : "btn-danger"}`}>
              Submit {checkForm.status === "Pass" ? "Pass" : "Fail"} Check
            </button>
            <button type="button"
              onClick={() => setCheckModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplianceDashboard;