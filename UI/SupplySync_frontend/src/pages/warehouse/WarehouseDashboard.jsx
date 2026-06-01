import { useState, useEffect } from "react";
import { purchaseOrderApi } from "../../api/purchaseOrderApi";
import { goodsReceiptApi } from "../../api/goodsReceiptApi";
import { inventoryApi } from "../../api/inventoryApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Package, Warehouse, ClipboardList, Plus,
  Trash2, ArrowUpDown, AlertTriangle, CheckCircle
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const WarehouseDashboard = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "incoming");
  const [orders, setOrders] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processedPOIds, setProcessedPOIds] = useState([]);

  const [grModal, setGRModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [grItems, setGRItems] = useState([
    { itemName: "", receivedQuantity: 1, condition: "Good" }
  ]);
  const [grRemarks, setGRRemarks] = useState("");
  const [grStatus, setGRStatus] = useState("Accepted");

  const [issueModal, setIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    inventoryItemId: 0,
    quantityIssued: 1,
    issuedTo: "",
    issueDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const [addInventoryModal, setAddInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    itemName: "", sku: "", quantityInStock: 0, unit: "Units"
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, receiptsRes, inventoryRes, issuesRes] = await Promise.all([
        purchaseOrderApi.getAll(),
        goodsReceiptApi.getAll(),
        inventoryApi.getAll(),
        inventoryApi.getAllIssues(),
      ]);
      setOrders(ordersRes.data);
      setReceipts(receiptsRes.data);

      const processed = receiptsRes.data
        .filter(r => r.status !== "Rejected")
        .map(r => r.purchaseOrderId);
      setProcessedPOIds(processed);

      setInventory(inventoryRes.data);
      setIssues(issuesRes.data);
    } catch {
      toast.error("Failed to load warehouse data.");
    } finally {
      setLoading(false);
    }
  };

  const openGRModal = (po) => {
    if (processedPOIds.includes(po.id)) {
      toast.error("Goods Receipt already created for this PO.");
      return;
    }
    setSelectedPO(po);
    setGRItems(po.items.map(i => ({
      itemName: i.itemName,
      receivedQuantity: i.quantity,
      condition: "Good"
    })));
    setGRRemarks("");
    setGRStatus("Accepted");
    setGRModal(true);
  };

  const updateGRItem = (index, key, value) =>
    setGRItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    ));

  const handleCreateGR = async (e) => {
    e.preventDefault();
    if (!selectedPO) return;
    try {
      await goodsReceiptApi.create({
        purchaseOrderId: selectedPO.id,
        remarks: grRemarks,
        status: grStatus,
        items: grItems,
      });
      toast.success("Goods receipt created. Inventory updated.");
      setGRModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create goods receipt.");
    }
  };

  const handleIssueItem = async (e) => {
    e.preventDefault();
    if (!issueForm.inventoryItemId || !issueForm.issuedTo) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      await inventoryApi.issueItem(issueForm);
      toast.success("Item issued successfully.");
      setIssueModal(false);
      setIssueForm({
        inventoryItemId: 0,
        quantityIssued: 1,
        issuedTo: "",
        issueDate: new Date().toISOString().split("T")[0],
        remarks: "",
      });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to issue item.");
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.create(inventoryForm);
      toast.success("Inventory item added.");
      setAddInventoryModal(false);
      setInventoryForm({ itemName: "", sku: "", quantityInStock: 0, unit: "Units" });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to add inventory.");
    }
  };

  const rejectedPOIds = receipts
    .filter(r => r.status === "Rejected")
    .map(r => r.purchaseOrderId);

  const acceptedPOIds = receipts
    .filter(r => r.status !== "Rejected")
    .map(r => r.purchaseOrderId);

  const incomingOrders = orders.filter(
    o => o.status === "Delivered" && !acceptedPOIds.includes(o.id)
  );

  const totalStock = inventory.reduce((s, i) => s + i.quantityInStock, 0);
  const lowStockItems = inventory.filter(i => i.quantityInStock <= 10);

  const stats = [
    { title: "Incoming POs", value: incomingOrders.length, icon: Package, color: "bg-blue-600" },
    { title: "Total Receipts", value: receipts.length, icon: ClipboardList, color: "bg-purple-600" },
    { title: "Total Stock", value: totalStock, icon: Warehouse, color: "bg-green-600", subtitle: "units" },
    { title: "Low Stock Items", value: lowStockItems.length, icon: AlertTriangle, color: "bg-red-500" },
  ];

  const tabs = [
    { key: "incoming", label: "Incoming Deliveries", icon: Package },
    { key: "inventory", label: "Inventory", icon: Warehouse },
    { key: "receipts", label: "Goods Receipts", icon: ClipboardList },
    { key: "issues", label: "Item Issues", icon: ArrowUpDown },
  ];

  return (
    <div>
      <h1 className="page-title">Warehouse Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200
                        rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-800">Low Stock Alert</p>
            <p className="text-xs text-red-600 mt-0.5">
              {lowStockItems.map(i => i.itemName).join(", ")} — restock needed.
            </p>
          </div>
        </div>
      )}

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
            {key === "incoming" && incomingOrders.length > 0 && (
              <span className="bg-blue-500 text-white text-xs
                               rounded-full px-1.5 py-0.5 ml-1">
                {incomingOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* ── Incoming Deliveries ── */}
          {tab === "incoming" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["PO Number", "Vendor", "Expected Delivery", "Items",
                        "PO Status", "GR Status", "Actions"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomingOrders.map(o => (
                      <tr key={o.id} className="table-row">
                        <td className="table-td font-mono text-xs font-semibold">
                          {o.poNumber}
                        </td>
                        <td className="table-td font-medium">{o.vendorName}</td>
                        <td className="table-td text-gray-500">
                          {new Date(o.expectedDeliveryDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          <div className="flex flex-col gap-0.5">
                            {o.items.slice(0, 2).map((item, i) => (
                              <span key={i} className="text-xs">
                                {item.itemName} × {item.quantity}
                              </span>
                            ))}
                            {o.items.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{o.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-td"><Badge status={o.status} /></td>
                        <td className="table-td">
                          {processedPOIds.includes(o.id) ? (
                            <span className="badge-approved">GR Created</span>
                          ) : (
                            <span className="badge-pending">Pending Receipt</span>
                          )}
                        </td>
                        <td className="table-td">
                          {processedPOIds.includes(o.id) ? (
                            <div className="flex items-center gap-1">
                              <span className="badge-approved flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Received
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openGRModal(o)}
                              className="flex items-center gap-1 text-xs
                                         btn-primary py-1 px-2">
                              <CheckCircle className="w-3 h-3" /> Receive Goods
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {incomingOrders.length === 0 && (
                      <tr>
                        <td colSpan={6}
                          className="table-td text-center text-gray-400 py-8">
                          No incoming deliveries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Inventory ── */}
          {tab === "inventory" && (
            <div>
              <div className="flex justify-end gap-3 mb-4">
                <button
                  onClick={() => setIssueModal(true)}
                  className="btn-secondary flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" /> Issue Item
                </button>
                <button
                  onClick={() => setAddInventoryModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              <div className="card p-0">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["Item Name", "SKU", "Quantity", "Unit",
                          "Last Updated", "Stock Level"].map(h => (
                            <th key={h} className="table-th">{h}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventory.map(item => (
                        <tr key={item.id} className="table-row">
                          <td className="table-td font-medium">{item.itemName}</td>
                          <td className="table-td font-mono text-xs text-gray-500">
                            {item.sku}
                          </td>
                          <td className="table-td font-semibold">
                            {item.quantityInStock}
                          </td>
                          <td className="table-td text-gray-500">{item.unit}</td>
                          <td className="table-td text-gray-500">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="table-td">
                            {item.quantityInStock <= 10 ? (
                              <span className="badge-rejected">Low Stock</span>
                            ) : item.quantityInStock <= 50 ? (
                              <span className="badge-pending">Medium</span>
                            ) : (
                              <span className="badge-approved">Sufficient</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {inventory.length === 0 && (
                        <tr>
                          <td colSpan={6}
                            className="table-td text-center text-gray-400 py-8">
                            No inventory items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Goods Receipts ── */}
          {tab === "receipts" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["GR Number", "PO Number", "Received Date",
                        "Items", "Remarks", "Status"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receipts.map(r => (
                      <tr key={r.id} className="table-row">
                        <td className="table-td font-mono text-xs font-semibold">
                          {r.grNumber}
                        </td>
                        <td className="table-td font-mono text-xs text-gray-500">
                          {r.poNumber}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(r.receivedDate).toLocaleDateString()}
                        </td>
                        <td className="table-td text-gray-500">
                          {r.items.length} item{r.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="table-td text-gray-500 max-w-xs truncate">
                          {r.remarks || "—"}
                        </td>
                        <td className="table-td"><Badge status={r.status} /></td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr>
                        <td colSpan={6}
                          className="table-td text-center text-gray-400 py-8">
                          No goods receipts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Item Issues ── */}
          {tab === "issues" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIssueModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" /> Issue Item
                </button>
              </div>
              <div className="card p-0">
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["Item", "Quantity Issued", "Issued To",
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
            </div>
          )}
        </>
      )}

      {/* ── Goods Receipt Modal ── */}
      <Modal
        isOpen={grModal}
        onClose={() => setGRModal(false)}
        title={`Receive Goods — ${selectedPO?.poNumber}`}
        size="xl">
        <form onSubmit={handleCreateGR} className="space-y-5">

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              Purchase Order Summary
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <span>Vendor: <strong>{selectedPO?.vendorName}</strong></span>
              <span>PO: <strong>{selectedPO?.poNumber}</strong></span>
              <span>Expected:{" "}
                <strong>
                  {selectedPO?.expectedDeliveryDate
                    ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()
                    : "—"}
                </strong>
              </span>
              <span>Items: <strong>{selectedPO?.items.length}</strong></span>
            </div>
          </div>

          <div>
            <label className="label">Warehouse Decision</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "Accepted",
                  label: "Accept All",
                  desc: "All goods are correct",
                  color: "border-green-500 bg-green-50 text-green-700",
                  active: grStatus === "Accepted"
                },
                {
                  value: "Rejected",
                  label: "Reject All",
                  desc: "Goods do not meet requirements",
                  color: "border-red-500 bg-red-50 text-red-700",
                  active: grStatus === "Rejected"
                },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGRStatus(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors
                              ${opt.active
                                ? opt.color
                                : "border-gray-200 text-gray-500"}`}>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs mt-0.5 opacity-75">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={`p-3 rounded-lg text-xs font-medium
            ${grStatus === "Accepted"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"}`}>
            {grStatus === "Accepted" &&
              "✅ All items marked as Good will be added to inventory automatically."}
            {grStatus === "Rejected" &&
              "❌ No items will be added to inventory. Vendor and Procurement Officer will be notified immediately."}
          </div>

          <div>
            <label className="label">
              Remarks{" "}
              {grStatus !== "Accepted" && (
                <span className="text-red-500">* Required for rejection</span>
              )}
            </label>
            <textarea className="input-field" rows={2}
              placeholder={
                grStatus === "Accepted"
                  ? "Optional remarks..."
                  : "Describe the issue clearly — this will be sent to vendor..."
              }
              value={grRemarks}
              onChange={e => setGRRemarks(e.target.value)}
              required={grStatus !== "Accepted"} />
          </div>

          <div>
            <p className="label mb-3">
              Verify Each Item
              <span className="text-xs font-normal text-gray-400 ml-2">
                Set condition for each item received
              </span>
            </p>
            <div className="space-y-3">
              {grItems.map((item, index) => (
                <div key={index}
                  className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8">
                      <p className="text-xs text-gray-500 mb-1">Item Name</p>
                      <input className="input-field text-sm bg-white"
                        value={item.itemName}
                        onChange={e => updateGRItem(index, "itemName", e.target.value)}
                        required />
                    </div>
                    <div className="col-span-4">
                      <p className="text-xs text-gray-500 mb-1">Received Qty</p>
                      <input type="number" min={0}
                        className="input-field text-sm bg-white"
                        value={item.receivedQuantity}
                        disabled />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Summary Before Confirming
            </p>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600 font-medium">
                ✅ Items: {grItems.length} (
                {grItems.reduce((s, i) => s + i.receivedQuantity, 0)} units
                → inventory)
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className={`flex-1 font-semibold py-2.5 rounded-lg text-white
                          transition-colors
                          ${grStatus === "Accepted"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"}`}>
              {grStatus === "Accepted" && "✅ Confirm & Add to Inventory"}
              {grStatus === "Rejected" && "❌ Reject & Notify Vendor"}
            </button>
            <button type="button"
              onClick={() => setGRModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Issue Item Modal ── */}
      <Modal
        isOpen={issueModal}
        onClose={() => setIssueModal(false)}
        title="Issue Item from Inventory"
        size="md">
        <form onSubmit={handleIssueItem} className="space-y-4">
          <div>
            <label className="label">Inventory Item</label>
            <select className="input-field"
              value={issueForm.inventoryItemId}
              onChange={e => setIssueForm({
                ...issueForm, inventoryItemId: parseInt(e.target.value)
              })}
              required>
              <option value={0}>Select item...</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.itemName} (Stock: {item.quantityInStock} {item.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity to Issue</label>
            <input type="number" min={1} className="input-field"
              value={issueForm.quantityIssued}
              onChange={e => setIssueForm({
                ...issueForm, quantityIssued: parseInt(e.target.value)
              })}
              required />
          </div>
          <div>
            <label className="label">Issued To (Employee / Department)</label>
            <input className="input-field"
              placeholder="e.g. John Doe / Engineering Dept"
              value={issueForm.issuedTo}
              onChange={e => setIssueForm({ ...issueForm, issuedTo: e.target.value })}
              required />
          </div>
          <div>
            <label className="label">Issue Date</label>
            <input type="date" className="input-field"
              value={issueForm.issueDate}
              onChange={e => setIssueForm({ ...issueForm, issueDate: e.target.value })}
              required />
          </div>
          <div>
            <label className="label">Remarks (Optional)</label>
            <input className="input-field"
              placeholder="Any additional notes"
              value={issueForm.remarks}
              onChange={e => setIssueForm({ ...issueForm, remarks: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              Issue Item
            </button>
            <button type="button"
              onClick={() => setIssueModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Inventory Modal ── */}
      <Modal
        isOpen={addInventoryModal}
        onClose={() => setAddInventoryModal(false)}
        title="Add Inventory Item"
        size="md">
        <form onSubmit={handleAddInventory} className="space-y-4">
          <div>
            <label className="label">Item Name</label>
            <input className="input-field"
              placeholder="e.g. Steel Bolts M8"
              value={inventoryForm.itemName}
              onChange={e => setInventoryForm({
                ...inventoryForm, itemName: e.target.value
              })}
              required />
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input-field"
              placeholder="e.g. SKU-001"
              value={inventoryForm.sku}
              onChange={e => setInventoryForm({
                ...inventoryForm, sku: e.target.value
              })}
              required />
          </div>
          <div>
            <label className="label">Initial Quantity</label>
            <input type="number" min={0} className="input-field"
              value={inventoryForm.quantityInStock}
              onChange={e => setInventoryForm({
                ...inventoryForm, quantityInStock: parseInt(e.target.value)
              })}
              required />
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input-field"
              value={inventoryForm.unit}
              onChange={e => setInventoryForm({
                ...inventoryForm, unit: e.target.value
              })}>
              {["Units", "Kg", "Litres", "Boxes", "Pallets", "Metres", "Pieces"].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Add Item</button>
            <button type="button"
              onClick={() => setAddInventoryModal(false)}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseDashboard;