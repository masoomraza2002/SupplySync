 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import VendorRegister from "../pages/auth/VendorRegister";
import Layout from "../components/layout/Layout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import VendorDashboard from "../pages/vendor/VendorDashboard";
import ProcurementDashboard from "../pages/procurement/ProcurementDashboard";
import WarehouseDashboard from "../pages/warehouse/WarehouseDashboard";
import FinanceDashboard from "../pages/finance/FinanceDashboard";
import ComplianceDashboard from "../pages/compliance/ComplianceDashboard";
import NotificationsPage from "../pages/shared/NotificationsPage";
import ProfilePage from "../pages/shared/ProfilePage";

const RoleRedirect = () => {
  const { user } = useAuth();
  const routes = {
    Admin:              "/admin",
    Vendor:             "/vendor",
    ProcurementOfficer: "/procurement",
    WarehouseManager:   "/warehouse",
    FinanceOfficer:     "/finance",
    ComplianceOfficer:  "/compliance",
  };
  return <Navigate to={routes[user?.role ?? ""] ?? "/login"} replace />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>

      {/* ── Public ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/vendor" element={<VendorRegister />} />
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/unauthorized" element={
        <div className="flex items-center justify-center h-screen">
          <p className="text-2xl font-bold text-red-600">
            403 — Unauthorized
          </p>
        </div>
      } />

      {/* ── Admin ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["Admin"]}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={["Admin"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute allowedRoles={["Admin"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Vendor ── */}
      <Route path="/vendor" element={
        <ProtectedRoute allowedRoles={["Vendor"]}>
          <Layout><VendorDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendor/notifications" element={
        <ProtectedRoute allowedRoles={["Vendor"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendor/profile" element={
        <ProtectedRoute allowedRoles={["Vendor"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Procurement ── */}
      <Route path="/procurement" element={
        <ProtectedRoute allowedRoles={["ProcurementOfficer"]}>
          <Layout><ProcurementDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/procurement/notifications" element={
        <ProtectedRoute allowedRoles={["ProcurementOfficer"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/procurement/profile" element={
        <ProtectedRoute allowedRoles={["ProcurementOfficer"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Warehouse ── */}
      <Route path="/warehouse" element={
        <ProtectedRoute allowedRoles={["WarehouseManager"]}>
          <Layout><WarehouseDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/warehouse/notifications" element={
        <ProtectedRoute allowedRoles={["WarehouseManager"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/warehouse/profile" element={
        <ProtectedRoute allowedRoles={["WarehouseManager"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Finance ── */}
      <Route path="/finance" element={
        <ProtectedRoute allowedRoles={["FinanceOfficer"]}>
          <Layout><FinanceDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/finance/notifications" element={
        <ProtectedRoute allowedRoles={["FinanceOfficer"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/finance/profile" element={
        <ProtectedRoute allowedRoles={["FinanceOfficer"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

      {/* ── Compliance ── */}
      <Route path="/compliance" element={
        <ProtectedRoute allowedRoles={["ComplianceOfficer"]}>
          <Layout><ComplianceDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/compliance/notifications" element={
        <ProtectedRoute allowedRoles={["ComplianceOfficer"]}>
          <Layout><NotificationsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/compliance/profile" element={
        <ProtectedRoute allowedRoles={["ComplianceOfficer"]}>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />

    </Routes>
  </BrowserRouter>
);

export default AppRouter;