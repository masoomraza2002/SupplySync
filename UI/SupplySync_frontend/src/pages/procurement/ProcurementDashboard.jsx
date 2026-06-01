import { useState, useEffect } from "react";
import { vendorApi } from "../../api/vendorApi";
import { contractApi } from "../../api/contractApi";
import { purchaseOrderApi } from "../../api/purchaseOrderApi";
import { reportsApi } from "../../api/reportsApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Truck, FileText, ShoppingCart, CheckCircle,
  XCircle, Plus, Trash2, Clock, AlertTriangle
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ProcurementDashboard = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "vendors");

  const [vendors, setVendors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(false);

  const [approvalModal, setApprovalModal] = useState({ open: false, vendor: null, action: "Approved" });
  const [rejectionReason, setRejectionReason] = useState("");

  const [contractModal, setContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    vendorId: 0, startDate: "", endDate: "",
    paymentTerms: "", deliveryTerms: "", itemPricing: ""
  });

  const [poModal, setPOModal] = useState(false);
  const [poForm, setPOForm] = useState({
    vendorId: 0, contractId: 0, expectedDeliveryDate: ""
  });
  const [poItems, setPOItems] = useState([
    { itemName: "", quantity: 1, unitPrice: 0 }
  ]);

  const [vendorDetailModal, setVendorDetailModal] = useState({ open: false, vendor: null });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [v, c, p, d] = await Promise.all([
        vendorApi.getAll(),
        contractApi.getAll(),
        purchaseOrderApi.getAll(),
        reportsApi.deliveryDelays(),
      ]);
      setVendors(v.data);
      setContracts(c.data);
      setOrders(p.data);
      setDelays(d.data);
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const openApproval = (vendor, action) => {
    setApprovalModal({ open: true, vendor, action });
    setRejectionReason("");
  };

  const handleVendorStatus = async () => {
    if (!approvalModal.vendor) return;
    try {
      await vendorApi.updateStatus(approvalModal.vendor.id, {
        status: approvalModal.action,
        rejectionReason: approvalModal.action === "Rejected"
          ? rejectionReason : undefined,
      });
      toast.success(`Vendor ${approvalModal.action.toLowerCase()} successfully.`);
      setApprovalModal({ open: false, vendor: null, action: "Approved" });
      loadAll();
    } catch {
      toast.error("Failed to update vendor status.");
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    if (!contractForm.vendorId) {
      toast.error("Please select a vendor.");
      return;
    }
    try {
      await contractApi.create(contractForm);
      toast.success("Contract created successfully.");
      setContractModal(false);
      setContractForm({
        vendorId: 0, startDate: "", endDate: "",
        paymentTerms: "", deliveryTerms: "", itemPricing: ""
      });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create contract.");
    }
  };

  const handleActivateContract = async (id) => {
    try {
      await contractApi.activate(id);
      toast.success("Contract activated.");
      loadAll();
    } catch { toast.error("Failed to activate contract."); }
  };

  const handleCloseContract = async (id) => {
    try {
      await contractApi.close(id);
      toast.success("Contract closed.");
      loadAll();
    } catch { toast.error("Failed to close contract."); }
  };

  const addPOItem = () =>
    setPOItems(prev => [...prev, { itemName: "", quantity: 1, unitPrice: 0 }]);

  const removePOItem = (index) =>
    setPOItems(prev => prev.filter((_, i) => i !== index));

  const updatePOItem = (index, key, value) =>
    setPOItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    ));

  const poTotal = poItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poForm.vendorId || !poForm.contractId) {
      toast.error("Please select vendor and contract.");
      return;
    }
    if (poItems.some(i => !i.itemName || i.quantity <= 0 || i.unitPrice <= 0)) {
      toast.error("Please fill all item details correctly.");
      return;
    }
    try {
      await purchaseOrderApi.create({ ...poForm, items: poItems });
      toast.success("Purchase Order created and sent to vendor.");
      setPOModal(false);
      setPOForm({ vendorId: 0, contractId: 0, expectedDeliveryDate: "" });
      setPOItems([{ itemName: "", quantity: 1, unitPrice: 0 }]);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create PO.");
    }
  };

  const handleCancelPO = async (id) => {
    try {
      await purchaseOrderApi.cancel(id);
      toast.success("Purchase Order cancelled.");
      loadAll();
    } catch { toast.error("Failed to cancel PO."); }
  };

  const pendingVendors = vendors.filter(v => v.status === "Pending");
  const approvedVendors = vendors.filter(v => v.status === "Approved");
  const activeContracts = contracts.filter(c => c.status === "Active");

  const stats = [
    { title: "Pending Vendors", value: pendingVendors.length, icon: Clock, color: "bg-yellow-500" },
    { title: "Approved Vendors", value: approvedVendors.length, icon: CheckCircle, color: "bg-green-600" },
    { title: "Active Contracts", value: activeContracts.length, icon: FileText, color: "bg-blue-600" },
    { title: "Total POs", value: orders.length, icon: ShoppingCart, color: "bg-purple-600" },
  ];

  const tabs = [
    { key: "vendors", label: "Vendors", icon: Truck },
    { key: "contracts", label: "Contracts", icon: FileText },
    { key: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
    { key: "delays", label: "Delayed POs", icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="page-title">Procurement Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                        border-b-2 transition-colors duration-150
                        ${tab === key
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Icon className="w-4 h-4" />
            {label}
            {key === "vendors" && pendingVendors.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs
                               rounded-full px-1.5 py-0.5 ml-1">
                {pendingVendors.length}
              </span>
            )}
            {key === "delays" && delays.length > 0 && (
              <span className="bg-red-500 text-white text-xs
                               rounded-full px-1.5 py-0.5 ml-1">
                {delays.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* ── Vendors Tab ── */}
          {tab === "vendors" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Code", "Company", "Email", "Phone", "Tax No", "Status", "Actions"].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendors.map(v => (
                      <tr key={v.id} className="table-row">
                        <td className="table-td font-mono text-xs">{v.vendorCode}</td>
                        <td className="table-td">
                          <button
                            onClick={() => setVendorDetailModal({ open: true, vendor: v })}
                            className="font-medium text-primary-600 hover:underline">
                            {v.companyName}
                          </button>
                        </td>
                        <td className="table-td text-gray-500">{v.contactEmail}</td>
                        <td className="table-td text-gray-500">{v.contactPhone}</td>
                        <td className="table-td text-gray-500">{v.taxNumber}</td>
                        <td className="table-td"><Badge status={v.status} /></td>
                        <td className="table-td">
                          {v.status === "Pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openApproval(v, "Approved")}
                                className="flex items-center gap-1 text-xs btn-success py-1 px-2">
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => openApproval(v, "Rejected")}
                                className="flex items-center gap-1 text-xs btn-danger py-1 px-2">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          )}
                          {v.status !== "Pending" && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="table-td text-center text-gray-400 py-8">
                          No vendors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Contracts Tab ── */}
          {tab === "contracts" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setContractModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Contract
                </button>
              </div>
              <div className="card p-0">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["Contract No", "Vendor", "Start", "End", "Payment Terms", "Status", "Actions"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contracts.map(c => (
                        <tr key={c.id} className="table-row">
                          <td className="table-td font-mono text-xs font-medium">
                            {c.contractNumber}
                          </td>
                          <td className="table-td font-medium">{c.vendorName}</td>
                          <td className="table-td text-gray-500">
                            {new Date(c.startDate).toLocaleDateString()}
                          </td>
                          <td className="table-td text-gray-500">
                            {new Date(c.endDate).toLocaleDateString()}
                          </td>
                          <td className="table-td text-gray-500 max-w-xs truncate">
                            {c.paymentTerms}
                          </td>
                          <td className="table-td"><Badge status={c.status} /></td>
                          <td className="table-td">
                            <div className="flex gap-2">
                              {c.status === "Draft" && (
                                <button
                                  onClick={() => handleActivateContract(c.id)}
                                  className="text-xs btn-success py-1 px-2">
                                  Activate
                                </button>
                              )}
                              {c.status === "Active" && (
                                <button
                                  onClick={() => handleCloseContract(c.id)}
                                  className="text-xs btn-secondary py-1 px-2">
                                  Close
                                </button>
                              )}
                              {c.status === "Closed" && (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {contracts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="table-td text-center text-gray-400 py-8">
                            No contracts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Purchase Orders Tab ── */}
          {tab === "purchase-orders" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setPOModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Purchase Order
                </button>
              </div>
              <div className="card p-0">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["PO Number", "Vendor", "Contract", "Expected Delivery", "Items", "Status", "Actions"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map(o => (
                        <tr key={o.id} className="table-row">
                          <td className="table-td font-mono text-xs font-medium">
                            {o.poNumber}
                          </td>
                          <td className="table-td font-medium">{o.vendorName}</td>
                          <td className="table-td text-gray-500 font-mono text-xs">
                            {o.contractNumber}
                          </td>
                          <td className="table-td text-gray-500">
                            {new Date(o.expectedDeliveryDate).toLocaleDateString()}
                          </td>
                          <td className="table-td text-gray-500">
                            {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                          </td>
                          <td className="table-td"><Badge status={o.status} /></td>
                          <td className="table-td">
                            {(o.status === "Created" || o.status === "Sent") && (
                              <button
                                onClick={() => handleCancelPO(o.id)}
                                className="text-xs btn-danger py-1 px-2">
                                Cancel
                              </button>
                            )}
                            {(o.status === "Delivered" || o.status === "Cancelled") && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="table-td text-center text-gray-400 py-8">
                            No purchase orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Delays Tab ── */}
          {tab === "delays" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["PO Number", "Vendor", "Expected Delivery", "Status", "Days Delayed"].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {delays.map((d, i) => (
                      <tr key={i} className="table-row">
                        <td className="table-td font-mono text-xs font-medium">
                          {d.poNumber}
                        </td>
                        <td className="table-td font-medium">{d.vendorName}</td>
                        <td className="table-td text-gray-500">
                          {new Date(d.expectedDeliveryDate).toLocaleDateString()}
                        </td>
                        <td className="table-td"><Badge status={d.status} /></td>
                        <td className="table-td">
                          <span className="text-red-600 font-semibold">
                            {d.daysDelayed} day{d.daysDelayed !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {delays.length === 0 && (
                      <tr>
                        <td colSpan={5} className="table-td text-center text-gray-400 py-8">
                          No delayed purchase orders. 🎉
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

      {/* ── Vendor Detail Modal ── */}
      <Modal
        isOpen={vendorDetailModal.open}
        onClose={() => setVendorDetailModal({ open: false, vendor: null })}
        title="Vendor Details"
        size="lg">
        {vendorDetailModal.vendor && (
          <div className="space-y-3">
            {[
              ["Vendor Code", vendorDetailModal.vendor.vendorCode],
              ["Company Name", vendorDetailModal.vendor.companyName],
              ["Email", vendorDetailModal.vendor.contactEmail],
              ["Phone", vendorDetailModal.vendor.contactPhone],
              ["Address", vendorDetailModal.vendor.address],
              ["Tax Number", vendorDetailModal.vendor.taxNumber],
              ["License Number", vendorDetailModal.vendor.licenseNumber],
              ["Document", vendorDetailModal.vendor.documentPath],
              ["Status", vendorDetailModal.vendor.status],
              ["Registered", new Date(vendorDetailModal.vendor.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 text-sm">
                <span className="w-36 text-gray-500 font-medium shrink-0">{label}</span>
                <span className="text-gray-900 break-all">{value}</span>
              </div>
            ))}
            {vendorDetailModal.vendor.rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                <strong>Rejection Reason:</strong>{" "}
                {vendorDetailModal.vendor.rejectionReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Vendor Approval Modal ── */}
      <Modal
        isOpen={approvalModal.open}
        onClose={() => setApprovalModal({ open: false, vendor: null, action: "Approved" })}
        title={`${approvalModal.action === "Approved" ? "Approve" : "Reject"} Vendor`}
        size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to{" "}
            <strong>{approvalModal.action === "Approved" ? "approve" : "reject"}</strong>{" "}
            vendor <strong>{approvalModal.vendor?.companyName}</strong>.
          </p>
          {approvalModal.action === "Rejected" && (
            <div>
              <label className="label">Rejection Reason</label>
              <textarea className="input-field" rows={3}
                placeholder="Please provide a reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                required />
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleVendorStatus}
              className={`flex-1 ${approvalModal.action === "Approved"
                ? "btn-success" : "btn-danger"}`}>
              Confirm {approvalModal.action === "Approved" ? "Approval" : "Rejection"}
            </button>
            <button
              onClick={() => setApprovalModal({ open: false, vendor: null, action: "Approved" })}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Create Contract Modal ── */}
      <Modal
        isOpen={contractModal}
        onClose={() => setContractModal(false)}
        title="Create New Contract"
        size="xl">
        <form onSubmit={handleCreateContract} className="space-y-4">
          <div>
            <label className="label">Vendor</label>
            <select className="input-field"
              value={contractForm.vendorId}
              onChange={e => setContractForm({
                ...contractForm, vendorId: parseInt(e.target.value)
              })}
              required>
              <option value={0}>Select approved vendor...</option>
              {approvedVendors.map(v => (
                <option key={v.id} value={v.id}>{v.companyName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input-field"
                value={contractForm.startDate}
                onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
                required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input-field"
                value={contractForm.endDate}
                onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })}
                required />
            </div>
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <input className="input-field"
              placeholder="e.g. Net 30 days"
              value={contractForm.paymentTerms}
              onChange={e => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
              required />
          </div>
          <div>
            <label className="label">Delivery Terms</label>
            <input className="input-field"
              placeholder="e.g. FOB Destination"
              value={contractForm.deliveryTerms}
              onChange={e => setContractForm({ ...contractForm, deliveryTerms: e.target.value })}
              required />
          </div>
          <div>
            <label className="label">Item Pricing Details</label>
            <textarea className="input-field" rows={3}
              placeholder="e.g. Item A: ₹10/unit, Item B: ₹25/unit"
              value={contractForm.itemPricing}
              onChange={e => setContractForm({ ...contractForm, itemPricing: e.target.value })}
              required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Create Contract</button>
            <button type="button" onClick={() => setContractModal(false)}
              className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* ── Create PO Modal ── */}
      <Modal
        isOpen={poModal}
        onClose={() => setPOModal(false)}
        title="Create Purchase Order"
        size="xl">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Vendor</label>
              <select className="input-field"
                value={poForm.vendorId}
                onChange={e => setPOForm({ ...poForm, vendorId: parseInt(e.target.value) })}
                required>
                <option value={0}>Select vendor...</option>
                {approvedVendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Contract</label>
              <select className="input-field"
                value={poForm.contractId}
                onChange={e => setPOForm({ ...poForm, contractId: parseInt(e.target.value) })}
                required>
                <option value={0}>Select active contract...</option>
                {activeContracts
                  .filter(c => !poForm.vendorId || c.vendorId === poForm.vendorId)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.vendorName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Expected Delivery Date</label>
            <input type="date" className="input-field"
              value={poForm.expectedDeliveryDate}
              onChange={e => setPOForm({ ...poForm, expectedDeliveryDate: e.target.value })}
              required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Order Items</label>
              <button type="button" onClick={addPOItem}
                className="flex items-center gap-1 text-sm text-primary-600
                           hover:text-primary-700 font-medium">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {poItems.map((item, index) => (
                <div key={index}
                  className="grid grid-cols-12 gap-2 items-center
                             p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="col-span-5">
                    <input className="input-field text-sm"
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={e => updatePOItem(index, "itemName", e.target.value)}
                      required />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min={1} className="input-field text-sm"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updatePOItem(index, "quantity", parseInt(e.target.value))}
                      required />
                  </div>
                  <div className="col-span-3">
                    <input type="number" min={0} step="0.01" className="input-field text-sm"
                      placeholder="Unit price"
                      value={item.unitPrice}
                      onChange={e => updatePOItem(index, "unitPrice", parseFloat(e.target.value))}
                      required />
                  </div>
                  <div className="col-span-1 text-sm text-gray-500 text-right">
                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {poItems.length > 1 && (
                      <button type="button" onClick={() => removePOItem(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-500
                                   transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-3 text-sm font-semibold text-gray-800">
              Total: ₹{poTotal.toFixed(2)}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              Create & Send PO
            </button>
            <button type="button" onClick={() => setPOModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProcurementDashboard;