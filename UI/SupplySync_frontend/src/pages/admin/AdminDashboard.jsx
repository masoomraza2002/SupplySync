import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { authApi } from "../../api/authApi";
import { vendorApi } from "../../api/vendorApi";
import { reportsApi } from "../../api/reportsApi";
import StatCard from "../../components/shared/StatCard";
import Badge from "../../components/shared/Badge";
import Modal from "../../components/shared/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Users, Building2, ShieldCheck, UserPlus,
  ToggleLeft, KeyRound, RefreshCw, TrendingUp
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "users");
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetModal, setResetModal] = useState({ open: false, userId: "" });
  const [newPassword, setNewPassword] = useState("");
  const [createForm, setCreateForm] = useState({
    fullName: "", email: "", password: "", role: "ProcurementOfficer"
  });

  const roles = [
    "ProcurementOfficer", "WarehouseManager",
    "FinanceOfficer", "ComplianceOfficer"
  ];

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setTab(t);
  }, [searchParams]);

  useEffect(() => { loadUsers(); loadVendors(); loadReports(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const loadVendors = async () => {
    try {
      const res = await vendorApi.getAll();
      setVendors(res.data);
    } catch {}
  };

  const loadReports = async () => {
    try {
      const res = await reportsApi.vendorPerformance();
      setPerformance(res.data);
    } catch {}
  };

  const toggleActive = async (id) => {
    try {
      const res = await adminApi.toggleActive(id);
      toast.success(res.data.message);
      loadUsers();
    } catch { toast.error("Failed to toggle user."); }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    try {
      await adminApi.resetPassword(resetModal.userId, newPassword);
      toast.success("Password reset successfully.");
      setResetModal({ open: false, userId: "" });
      setNewPassword("");
    } catch { toast.error("Failed to reset password."); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await authApi.register(createForm);
      toast.success("User created successfully.");
      setCreateForm({ fullName: "", email: "", password: "", role: "ProcurementOfficer" });
      loadUsers();
      setTab("users");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create user.");
    }
  };

  const stats = [
    { title: "Total Users", value: users.length, icon: Users, color: "bg-primary-600" },
    { title: "Total Vendors", value: vendors.length, icon: Building2, color: "bg-purple-600" },
    { title: "Approved Vendors", value: vendors.filter(v => v.status === "Approved").length, icon: ShieldCheck, color: "bg-green-600" },
    { title: "Pending Vendors", value: vendors.filter(v => v.status === "Pending").length, icon: RefreshCw, color: "bg-yellow-500" },
  ];

  const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "vendors", label: "Vendors", icon: Building2 },
    { key: "create-user", label: "Create User", icon: UserPlus },
    { key: "reports", label: "Reports", icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
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

      {/* Users Tab */}
      {tab === "users" && (
        loading ? <LoadingSpinner /> :
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  {["Full Name","Email","Role","Status","Actions"].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="table-td font-medium">{u.fullName}</td>
                    <td className="table-td text-gray-500">{u.email}</td>
                    <td className="table-td">
                      <span className="badge-active">{u.roles[0] ?? "—"}</span>
                    </td>
                    <td className="table-td">
                      <Badge status={u.isActive ? "Approved" : "Rejected"} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(u.id)}
                          title={u.isActive ? "Deactivate" : "Activate"}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <ToggleLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setResetModal({ open: true, userId: u.id })}
                          title="Reset Password"
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <KeyRound className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {tab === "vendors" && (
        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  {["Code","Company","Email","Phone","Status","Created"].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.map(v => (
                  <tr key={v.id} className="table-row">
                    <td className="table-td font-mono text-xs">{v.vendorCode}</td>
                    <td className="table-td font-medium">{v.companyName}</td>
                    <td className="table-td text-gray-500">{v.contactEmail}</td>
                    <td className="table-td text-gray-500">{v.contactPhone}</td>
                    <td className="table-td"><Badge status={v.status} /></td>
                    <td className="table-td text-gray-500">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Tab */}
      {tab === "create-user" && (
        <div className="card max-w-xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Create Internal User
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" placeholder="Jane Smith"
                value={createForm.fullName}
                onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field"
                placeholder="jane@company.com"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field"
                placeholder="Min. 6 characters"
                value={createForm.password}
                onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input-field"
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">
              Create User
            </button>
          </form>
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div className="card p-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Vendor Performance Report
            </h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  {["Company","Status","Total POs","Delivered","Invoices","Approved","Total Spend"].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {performance.map((p, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-td font-medium">{p.companyName}</td>
                    <td className="table-td"><Badge status={p.status} /></td>
                    <td className="table-td">{p.totalPOs}</td>
                    <td className="table-td">{p.deliveredPOs}</td>
                    <td className="table-td">{p.totalInvoices}</td>
                    <td className="table-td">{p.approvedInvoices}</td>
                    <td className="table-td font-semibold text-green-600">
                      ₹{p.totalSpend?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModal.open}
        onClose={() => setResetModal({ open: false, userId: "" })}
        title="Reset User Password"
        size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleResetPassword} className="btn-primary flex-1">
              Reset Password
            </button>
            <button
              onClick={() => setResetModal({ open: false, userId: "" })}
              className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;