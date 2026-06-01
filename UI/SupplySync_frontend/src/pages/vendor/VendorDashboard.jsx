import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { vendorApi } from "../../api/vendorApi";
import { purchaseOrderApi } from "../../api/purchaseOrderApi";
import { invoiceApi } from "../../api/invoiceApi";
import { contractApi } from "../../api/contractApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ShoppingCart, Receipt, FileText, CheckCircle,
  Truck, Clock, Plus, Building2, AlertCircle
} from "lucide-react";
import { goodsReceiptApi } from "../../api/goodsReceiptApi";
import { useSearchParams } from "react-router-dom";

const VendorDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "overview");
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reapplyModal, setReapplyModal] = useState(false);
  const [goodsReceipts, setGoodsReceipts] = useState([]);

  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    purchaseOrderId: 0,
    goodsReceiptId: 0,
    totalAmount: 0,
  });

  const [poDetailModal, setPODetailModal] = useState({ open: false, po: null });

  const [reapplyForm, setReapplyForm] = useState({
    taxNumber: "",
    licenseNumber: "",
    documentPath: "",
    contactPhone: "",
    address: "",
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => { loadAll(); }, []);

  const loadGoodsReceipts = async (deliveredOrders) => {
    const allGRs = [];
    console.log("Delivered orders:", deliveredOrders);
    for (const order of deliveredOrders) {
      try {
        const res = await goodsReceiptApi.getByPO(order.id);
        console.log(`GRs for PO ${order.id}:`, res.data);
        if (res.data && res.data.length > 0) {
          allGRs.push(...res.data);
        }
      } catch (err) {
        console.log(`Failed for PO ${order.id}:`, err);
      }
    }
    console.log("All GRs loaded:", allGRs);
    setGoodsReceipts(allGRs);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const vendorRes = await vendorApi.getMyProfile();
      const v = vendorRes.data;
      setVendor(v);

      const [ordersRes, invoicesRes, contractsRes] = await Promise.all([
        purchaseOrderApi.getByVendor(v.id),
        invoiceApi.getByVendor(v.id),
        contractApi.getByVendor(v.id),
      ]);
      setOrders(ordersRes.data);
      setInvoices(invoicesRes.data);
      setContracts(contractsRes.data);

      const delivered = ordersRes.data.filter(o => o.status === "Delivered");
      await loadGoodsReceipts(delivered);

    } catch {
      toast.error("Failed to load vendor data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = async (e) => {
    e.preventDefault();
    try {
      await vendorApi.reapply(reapplyForm);
      toast.success("Reapplication submitted. Awaiting approval.");
      setReapplyModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to reapply.");
    }
  };

  const handleUpdateDelivery = async (id) => {
    try {
      await purchaseOrderApi.updateStatus(id, "Delivered");
      toast.success("Delivery status updated.");
      loadAll();
    } catch {
      toast.error("Failed to update delivery status.");
    }
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.purchaseOrderId || !invoiceForm.goodsReceiptId) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await invoiceApi.submit(invoiceForm);
      toast.success("Invoice submitted successfully.");
      setInvoiceModal(false);
      setInvoiceForm({ purchaseOrderId: 0, goodsReceiptId: 0, totalAmount: 0 });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to submit invoice.");
    }
  };

  const deliveredOrders = orders.filter(o => o.status === "Delivered");
  const pendingOrders = orders.filter(o =>
    o.status === "Sent" || o.status === "Created");
  const approvedInvoices = invoices.filter(i => i.status === "Approved");
  const activeContracts = contracts.filter(c => c.status === "Active");

  const stats = [
    { title: "Total Orders", value: orders.length, icon: ShoppingCart, color: "bg-primary-600" },
    { title: "Pending Delivery", value: pendingOrders.length, icon: Clock, color: "bg-yellow-500" },
    { title: "Delivered", value: deliveredOrders.length, icon: CheckCircle, color: "bg-green-600" },
    { title: "Paid Invoices", value: approvedInvoices.length, icon: Receipt, color: "bg-purple-600" },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "orders", label: "Purchase Orders", icon: ShoppingCart },
    { key: "invoices", label: "Invoices", icon: Receipt },
    { key: "contracts", label: "Contracts", icon: FileText },
  ];

  return (
    <div>
      <h1 className="page-title">Vendor Dashboard</h1>

      {/* Pending Banner */}
      {vendor && vendor.status === "Pending" && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3
                        bg-yellow-50 border border-yellow-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-yellow-600" />
          <div>
            <p className="font-semibold text-sm text-yellow-800">
              Account Pending Approval
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Your account is awaiting approval from the Procurement Officer.
            </p>
          </div>
        </div>
      )}

      {/* Rejected Banner */}
      {vendor && vendor.status === "Rejected" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-red-800">
                  Account Rejected
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  Reason: {vendor.rejectionReason}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReapplyForm({
                  taxNumber: vendor.taxNumber,
                  licenseNumber: vendor.licenseNumber,
                  documentPath: vendor.documentPath,
                  contactPhone: vendor.contactPhone,
                  address: vendor.address,
                });
                setReapplyModal(true);
              }}
              className="btn-primary text-sm shrink-0">
              Reapply Now
            </button>
          </div>
        </div>
      )}

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
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* ── Overview Tab ── */}
          {tab === "overview" && vendor && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Vendor Profile
                </h2>
                <div className="space-y-3">
                  {[
                    ["Vendor Code", vendor.vendorCode],
                    ["Company", vendor.companyName],
                    ["Email", vendor.contactEmail],
                    ["Phone", vendor.contactPhone],
                    ["Address", vendor.address],
                    ["Tax Number", vendor.taxNumber],
                    ["License", vendor.licenseNumber],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-3 text-sm">
                      <span className="w-28 text-gray-500 font-medium shrink-0">
                        {label}
                      </span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                  <div className="flex gap-3 text-sm">
                    <span className="w-28 text-gray-500 font-medium shrink-0">
                      Status
                    </span>
                    <Badge status={vendor.status} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-2">
                      Recent Orders
                    </p>
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id}
                        className="flex items-center justify-between py-2
                                   border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {o.poNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge status={o.status} />
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-sm text-gray-400">No orders yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Active Contracts
                </h2>
                {activeContracts.length === 0 ? (
                  <p className="text-sm text-gray-400">No active contracts.</p>
                ) : (
                  <div className="space-y-3">
                    {activeContracts.map(c => (
                      <div key={c.id}
                        className="p-4 bg-blue-50 border border-blue-100
                                   rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-blue-900">
                            {c.contractNumber}
                          </p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            {new Date(c.startDate).toLocaleDateString()} —{" "}
                            {new Date(c.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Payment: {c.paymentTerms} | Delivery: {c.deliveryTerms}
                          </p>
                        </div>
                        <Badge status={c.status} />
                      </div>
                    ))}
                  </div>
                )}
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
                      {["PO Number", "Contract", "Expected Delivery", "Items", "Status", "Actions"].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map(o => (
                      <tr key={o.id} className="table-row">
                        <td className="table-td">
                          <button
                            onClick={() => setPODetailModal({ open: true, po: o })}
                            className="font-mono text-xs font-semibold
                                       text-primary-600 hover:underline">
                            {o.poNumber}
                          </button>
                        </td>
                        <td className="table-td font-mono text-xs text-gray-500">
                          {o.contractNumber}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(o.expectedDeliveryDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="table-td">
                          <Badge status={o.status} />
                        </td>
                        <td className="table-td">
                          {o.status === "Sent" && (
                            <button
                              onClick={() => handleUpdateDelivery(o.id)}
                              className="flex items-center gap-1 text-xs
                                         btn-success py-1 px-2">
                              <Truck className="w-3 h-3" /> Mark Delivered
                            </button>
                          )}
                          {o.status !== "Sent" && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6}
                          className="table-td text-center text-gray-400 py-8">
                          No purchase orders yet.
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
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setInvoiceModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Submit Invoice
                </button>
              </div>
              <div className="card p-0">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["Invoice No", "PO Number", "Amount", "Status", "Submitted", "Reason"].map(h => (
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
                          <td className="table-td font-mono text-xs text-gray-500">
                            {inv.poNumber}
                          </td>
                          <td className="table-td font-semibold text-green-700">
                            ₹{inv.totalAmount.toFixed(2)}
                          </td>
                          <td className="table-td">
                            <Badge status={inv.status} />
                          </td>
                          <td className="table-td text-gray-500">
                            {new Date(inv.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="table-td text-gray-500 text-xs max-w-xs truncate">
                            {inv.rejectionReason ?? "—"}
                          </td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td colSpan={6}
                            className="table-td text-center text-gray-400 py-8">
                            No invoices submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                      {["Contract No", "Start Date", "End Date", "Payment Terms",
                        "Delivery Terms", "Status"].map(h => (
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
                        <td className="table-td text-gray-500">
                          {new Date(c.startDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(c.endDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">{c.paymentTerms}</td>
                        <td className="table-td text-gray-500">{c.deliveryTerms}</td>
                        <td className="table-td"><Badge status={c.status} /></td>
                      </tr>
                    ))}
                    {contracts.length === 0 && (
                      <tr>
                        <td colSpan={6}
                          className="table-td text-center text-gray-400 py-8">
                          No contracts found.
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

      {/* ── PO Detail Modal ── */}
      <Modal
        isOpen={poDetailModal.open}
        onClose={() => setPODetailModal({ open: false, po: null })}
        title="Purchase Order Details"
        size="lg">
        {poDetailModal.po && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["PO Number", poDetailModal.po.poNumber],
                ["Contract", poDetailModal.po.contractNumber],
                ["Status", poDetailModal.po.status],
                ["Expected Delivery",
                  new Date(poDetailModal.po.expectedDeliveryDate).toLocaleDateString()],
                ["Created", new Date(poDetailModal.po.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400
                            uppercase tracking-wider mb-3">
                Items
              </p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Item", "Qty", "Unit Price", "Total"].map(h => (
                        <th key={h} className="table-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {poDetailModal.po.items.map((item, i) => (
                      <tr key={i} className="bg-white">
                        <td className="table-td">{item.itemName}</td>
                        <td className="table-td">{item.quantity}</td>
                        <td className="table-td">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="table-td font-semibold text-green-700">
                          ₹{item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3}
                        className="table-td text-right font-bold text-gray-700">
                        Total
                      </td>
                      <td className="table-td font-bold text-green-700">
                        ₹{poDetailModal.po.items
                          .reduce((s, i) => s + i.totalPrice, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Submit Invoice Modal ── */}
      <Modal
        isOpen={invoiceModal}
        onClose={() => setInvoiceModal(false)}
        title="Submit Invoice"
        size="md">
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          <div>
            <label className="label">Purchase Order</label>
            <select className="input-field"
              value={invoiceForm.purchaseOrderId}
              onChange={e => {
                const selectedPOId = parseInt(e.target.value);
                const selectedPO = deliveredOrders.find(o => o.id === selectedPOId);
                const autoTotal = selectedPO
                  ? selectedPO.items.reduce((sum, i) => sum + i.totalPrice, 0)
                  : 0;
                setInvoiceForm({
                  ...invoiceForm,
                  purchaseOrderId: selectedPOId,
                  goodsReceiptId: 0,
                  totalAmount: autoTotal,
                });
              }}
              required>
              <option value={0}>Select delivered PO...</option>
              {deliveredOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.poNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Goods Receipt</label>
            {invoiceForm.purchaseOrderId === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Select a PO first to see its goods receipts.
              </p>
            ) : (
              <>
                <select className="input-field"
                  value={invoiceForm.goodsReceiptId}
                  onChange={e => setInvoiceForm({
                    ...invoiceForm,
                    goodsReceiptId: parseInt(e.target.value)
                  })}
                  required>
                  <option value={0}>Select goods receipt...</option>
                  {goodsReceipts
                    .filter(gr =>
                      Number(gr.purchaseOrderId) === Number(invoiceForm.purchaseOrderId) &&
                      gr.status !== "Rejected")
                    .map(gr => (
                      <option key={gr.id} value={gr.id}>
                        GR #{gr.id} — {gr.grNumber} —{" "}
                        {new Date(gr.receivedDate).toLocaleDateString()} —{" "}
                        {gr.status}
                      </option>
                    ))}
                </select>
                {goodsReceipts.filter(gr =>
                  Number(gr.purchaseOrderId) === Number(invoiceForm.purchaseOrderId)
                ).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No goods receipt found for this PO yet.
                    Warehouse must receive the goods first.
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="label">Total Amount (₹)</label>
            <input
              type="number"
              className="input-field bg-gray-100 cursor-not-allowed"
              value={invoiceForm.totalAmount.toFixed(2)}
              readOnly
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">
              Auto-calculated from Purchase Order items.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              Submit Invoice
            </button>
            <button type="button"
              onClick={() => setInvoiceModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Reapply Modal ── */}
      <Modal
        isOpen={reapplyModal}
        onClose={() => setReapplyModal(false)}
        title="Reapply for Vendor Approval"
        size="md">
        <form onSubmit={handleReapply} className="space-y-4">
          <p className="text-sm text-gray-500">
            Update your details and resubmit for approval.
          </p>
          <div>
            <label className="label">Contact Phone</label>
            <input className="input-field"
              value={reapplyForm.contactPhone}
              onChange={e => setReapplyForm({
                ...reapplyForm, contactPhone: e.target.value
              })}
              required />
          </div>
          <div>
            <label className="label">Tax Number</label>
            <input className="input-field"
              value={reapplyForm.taxNumber}
              onChange={e => setReapplyForm({
                ...reapplyForm, taxNumber: e.target.value
              })}
              required />
          </div>
          <div>
            <label className="label">License Number</label>
            <input className="input-field"
              value={reapplyForm.licenseNumber}
              onChange={e => setReapplyForm({
                ...reapplyForm, licenseNumber: e.target.value
              })}
              required />
          </div>
          <div>
            <label className="label">Document Path / URL</label>
            <input className="input-field"
              value={reapplyForm.documentPath}
              onChange={e => setReapplyForm({
                ...reapplyForm, documentPath: e.target.value
              })} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input-field" rows={2}
              value={reapplyForm.address}
              onChange={e => setReapplyForm({
                ...reapplyForm, address: e.target.value
              })}
              required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              Submit Reapplication
            </button>
            <button type="button"
              onClick={() => setReapplyModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorDashboard;