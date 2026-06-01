import { useState, useEffect } from "react";
import { invoiceApi } from "../../api/invoiceApi";
import { reportsApi } from "../../api/reportsApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Receipt, CheckCircle, XCircle, DollarSign,
  Clock, TrendingUp, Eye, CreditCard
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const FinanceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [spending, setSpending] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "invoices");

  const [reviewModal, setReviewModal] = useState({ open: false, invoice: null, action: "Approved" });
  const [rejectionReason, setRejectionReason] = useState("");

  const [paymentModal, setPaymentModal] = useState({ open: false, invoice: null });
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    paymentReference: "",
  });

  const [detailModal, setDetailModal] = useState({ open: false, invoice: null });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [invRes, spendRes] = await Promise.all([
        invoiceApi.getAll(),
        reportsApi.procurementSpending(),
      ]);
      setInvoices(invRes.data);
      setSpending(spendRes.data);
    } catch {
      toast.error("Failed to load finance data.");
    } finally {
      setLoading(false);
    }
  };

  const openReview = (invoice, action) => {
    setReviewModal({ open: true, invoice, action });
    setRejectionReason("");
  };

  const handleReview = async () => {
    if (!reviewModal.invoice) return;
    if (reviewModal.action === "Rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    try {
      await invoiceApi.review(reviewModal.invoice.id, {
        status: reviewModal.action,
        rejectionReason: reviewModal.action === "Rejected"
          ? rejectionReason : undefined,
      });
      toast.success(`Invoice ${reviewModal.action.toLowerCase()} successfully.`);
      setReviewModal({ open: false, invoice: null, action: "Approved" });
      loadAll();
    } catch {
      toast.error("Failed to review invoice.");
    }
  };

  const openPayment = (invoice) => {
    setPaymentModal({ open: true, invoice });
    setPaymentForm({ amountPaid: invoice.totalAmount, paymentReference: "" });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentModal.invoice) return;
    if (!paymentForm.paymentReference.trim()) {
      toast.error("Please enter a payment reference.");
      return;
    }
    try {
      await invoiceApi.processPayment({
        invoiceId: paymentModal.invoice.id,
        amountPaid: paymentForm.amountPaid,
        paymentReference: paymentForm.paymentReference,
      });
      toast.success("Payment processed successfully.");
      setPaymentModal({ open: false, invoice: null });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to process payment.");
    }
  };

  const submittedInvoices = invoices.filter(i => i.status === "Submitted");
  const approvedInvoices = invoices.filter(i => i.status === "Approved");
  const rejectedInvoices = invoices.filter(i => i.status === "Rejected");
  const totalApprovedAmount = approvedInvoices.reduce((s, i) => s + i.totalAmount, 0);

  const stats = [
    { title: "Pending Review", value: submittedInvoices.length, icon: Clock, color: "bg-yellow-500" },
    { title: "Approved Invoices", value: approvedInvoices.length, icon: CheckCircle, color: "bg-green-600" },
    { title: "Rejected Invoices", value: rejectedInvoices.length, icon: XCircle, color: "bg-red-500" },
    {
      title: "Total Approved",
      value: `₹${totalApprovedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-primary-600"
    },
  ];

  const tabs = [
    { key: "invoices", label: "Invoices", icon: Receipt },
    { key: "payments", label: "Payment History", icon: CreditCard },
    { key: "spending", label: "Spending Report", icon: TrendingUp },
  ];

  const paidRecords = spending?.records ?? [];

  return (
    <div>
      <h1 className="page-title">Finance Dashboard</h1>

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
            {key === "invoices" && submittedInvoices.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs
                               rounded-full px-1.5 py-0.5 ml-1">
                {submittedInvoices.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* ── Invoices Tab ── */}
          {tab === "invoices" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Invoice No", "Vendor", "PO Number", "Amount",
                        "Submitted", "Status", "Actions"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="table-row">
                        <td className="table-td">
                          <button
                            onClick={() => setDetailModal({ open: true, invoice: inv })}
                            className="font-mono text-xs font-semibold
                                       text-primary-600 hover:underline">
                            {inv.invoiceNumber}
                          </button>
                        </td>
                        <td className="table-td font-medium">{inv.vendorName}</td>
                        <td className="table-td font-mono text-xs text-gray-500">
                          {inv.poNumber}
                        </td>
                        <td className="table-td font-semibold text-green-700">
                          ₹{inv.totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2
                          })}
                        </td>
                        <td className="table-td text-gray-500">
                          {new Date(inv.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="table-td">
                          <Badge status={inv.status} />
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailModal({ open: true, invoice: inv })}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            {inv.status === "Submitted" && (
                              <>
                                <button
                                  onClick={() => openReview(inv, "Approved")}
                                  className="flex items-center gap-1 text-xs btn-success py-1 px-2">
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => openReview(inv, "Rejected")}
                                  className="flex items-center gap-1 text-xs btn-danger py-1 px-2">
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                            {inv.status === "Approved" && (
                              inv.isPaid ? (
                                <span className="flex items-center gap-1 text-xs badge-approved px-2 py-1">
                                  <CheckCircle className="w-3 h-3" /> Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => openPayment(inv)}
                                  className="flex items-center gap-1 text-xs btn-primary py-1 px-2">
                                  <CreditCard className="w-3 h-3" /> Pay
                                </button>
                              )
                            )}
                            {inv.status === "Rejected" && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={7}
                          className="table-td text-center text-gray-400 py-8">
                          No invoices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Payment History Tab ── */}
          {tab === "payments" && (
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      {["Invoice No", "Vendor", "PO Number", "Amount",
                        "Payment Date", "Reference"].map(h => (
                          <th key={h} className="table-th">{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paidRecords
                      .filter(r => r.paymentDate)
                      .map((r, i) => (
                        <tr key={i} className="table-row">
                          <td className="table-td font-mono text-xs font-semibold">
                            {r.invoiceNumber}
                          </td>
                          <td className="table-td font-medium">{r.vendorName}</td>
                          <td className="table-td font-mono text-xs text-gray-500">
                            {r.poNumber}
                          </td>
                          <td className="table-td font-semibold text-green-700">
                            ₹{r.totalAmount?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2
                            })}
                          </td>
                          <td className="table-td text-gray-500">
                            {new Date(r.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="table-td font-mono text-xs text-gray-600">
                            {r.paymentReference ? (
                              <span className="text-green-600 font-semibold">
                                {r.paymentReference}
                              </span>
                            ) : (
                              <span className="badge-pending">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {paidRecords.filter(r => r.paymentDate).length === 0 && (
                      <tr>
                        <td colSpan={6}
                          className="table-td text-center text-gray-400 py-8">
                          No payments processed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Spending Report Tab ── */}
          {tab === "spending" && (
            <div className="space-y-6">
              <div className="card bg-gradient-to-br from-primary-600
                              to-primary-800 text-white">
                <p className="text-primary-100 text-sm font-medium mb-1">
                  Total Procurement Spending
                </p>
                <p className="text-4xl font-bold">
                  ₹{spending?.total?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2
                  }) ?? "0.00"}
                </p>
                <p className="text-primary-200 text-xs mt-2">
                  Across {spending?.records?.length ?? 0} approved invoices
                </p>
              </div>

              <div className="card p-0">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800">
                    Spending Breakdown
                  </h2>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead className="table-head">
                      <tr>
                        {["Invoice No", "Vendor", "PO", "Amount",
                          "Submitted", "Payment Ref"].map(h => (
                            <th key={h} className="table-th">{h}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(spending?.records ?? []).map((r, i) => (
                        <tr key={i} className="table-row">
                          <td className="table-td font-mono text-xs font-semibold">
                            {r.invoiceNumber}
                          </td>
                          <td className="table-td font-medium">{r.vendorName}</td>
                          <td className="table-td font-mono text-xs text-gray-500">
                            {r.poNumber}
                          </td>
                          <td className="table-td font-bold text-green-700">
                            ₹{r.totalAmount?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2
                            })}
                          </td>
                          <td className="table-td text-gray-500">
                            {new Date(r.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="table-td font-mono text-xs text-gray-600">
                            {r.paymentReference ?? "Pending"}
                          </td>
                        </tr>
                      ))}
                      {(spending?.records ?? []).length === 0 && (
                        <tr>
                          <td colSpan={6}
                            className="table-td text-center text-gray-400 py-8">
                            No spending records yet.
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

      {/* ── Invoice Detail Modal ── */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, invoice: null })}
        title="Invoice Details"
        size="lg">
        {detailModal.invoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Invoice Number", detailModal.invoice.invoiceNumber],
                ["Vendor", detailModal.invoice.vendorName],
                ["PO Number", detailModal.invoice.poNumber],
                ["GR ID", detailModal.invoice.goodsReceiptId],
                ["Total Amount", `₹${detailModal.invoice.totalAmount.toFixed(2)}`],
                ["Status", detailModal.invoice.status],
                ["Submitted", new Date(detailModal.invoice.submittedAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {detailModal.invoice.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-100
                              rounded-lg text-sm text-red-700">
                <strong>Rejection Reason:</strong>{" "}
                {detailModal.invoice.rejectionReason}
              </div>
            )}

            <div className={`p-3 rounded-lg text-sm font-medium
              ${detailModal.invoice?.goodsReceiptId
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"}`}>
              {detailModal.invoice?.goodsReceiptId
                ? "✅ Goods Receipt verified by Warehouse Manager. " +
                  `GR ID: #${detailModal.invoice.goodsReceiptId}`
                : "❌ No Goods Receipt linked. Cannot approve this invoice."}
            </div>

            {detailModal.invoice.status === "Submitted" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setDetailModal({ open: false, invoice: null });
                    openReview(detailModal.invoice, "Approved");
                  }}
                  className="btn-success flex-1">
                  Approve Invoice
                </button>
                <button
                  onClick={() => {
                    setDetailModal({ open: false, invoice: null });
                    openReview(detailModal.invoice, "Rejected");
                  }}
                  className="btn-danger flex-1">
                  Reject Invoice
                </button>
              </div>
            )}

            {detailModal.invoice.status === "Approved" && (
              detailModal.invoice.isPaid ? (
                <div className="p-3 bg-green-50 border border-green-200
                                rounded-lg text-center">
                  <p className="text-green-700 font-semibold text-sm">
                    ✅ Payment Completed
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Ref: {detailModal.invoice.paymentReference}
                  </p>
                  <p className="text-green-500 text-xs mt-0.5">
                    {detailModal.invoice.paymentDate
                      ? new Date(detailModal.invoice.paymentDate).toLocaleString()
                      : ""}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDetailModal({ open: false, invoice: null });
                    openPayment(detailModal.invoice);
                  }}
                  className="btn-primary w-full">
                  Process Payment
                </button>
              )
            )}
          </div>
        )}
      </Modal>

      {/* ── Review Modal ── */}
      <Modal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, invoice: null, action: "Approved" })}
        title={`${reviewModal.action === "Approved" ? "Approve" : "Reject"} Invoice`}
        size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to{" "}
            <strong>
              {reviewModal.action === "Approved" ? "approve" : "reject"}
            </strong>{" "}
            invoice{" "}
            <strong>{reviewModal.invoice?.invoiceNumber}</strong>{" "}
            for{" "}
            <strong>
              ₹{reviewModal.invoice?.totalAmount.toFixed(2)}
            </strong>.
          </p>

          {reviewModal.action === "Rejected" && (
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
              onClick={handleReview}
              className={`flex-1 ${reviewModal.action === "Approved"
                ? "btn-success" : "btn-danger"}`}>
              Confirm{" "}
              {reviewModal.action === "Approved" ? "Approval" : "Rejection"}
            </button>
            <button
              onClick={() => setReviewModal({ open: false, invoice: null, action: "Approved" })}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Payment Modal ── */}
      <Modal
        isOpen={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, invoice: null })}
        title="Process Payment"
        size="sm">
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-100
                          rounded-xl text-center">
            <p className="text-xs text-green-600 mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-green-700">
              ₹{paymentModal.invoice?.totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Invoice: {paymentModal.invoice?.invoiceNumber}
            </p>
          </div>

          <div>
            <label className="label">Amount Paid (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="input-field bg-gray-50 cursor-not-allowed"
              value={paymentForm.amountPaid}
              readOnly
            />
            <p className="text-xs text-gray-400 mt-1">
              Full payment amount is fixed and cannot be changed.
            </p>
          </div>

          <div>
            <label className="label">Payment Reference</label>
            <input className="input-field"
              placeholder="e.g. TXN-20240501-001"
              value={paymentForm.paymentReference}
              onChange={e => setPaymentForm({
                ...paymentForm, paymentReference: e.target.value
              })}
              required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-success flex-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Confirm Payment
            </button>
            <button type="button"
              onClick={() => setPaymentModal({ open: false, invoice: null })}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceDashboard;