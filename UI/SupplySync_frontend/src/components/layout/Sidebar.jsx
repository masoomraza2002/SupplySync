import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, FileText, ShoppingCart,
  Package, Receipt, ClipboardCheck, BarChart3,
  Truck, Warehouse, Building2, UserPlus, TrendingUp,
  AlertTriangle, ClipboardList, ArrowUpDown, CreditCard,
  ShieldCheck, Bell, User, LogOut, Settings,
  ChevronRight, Activity, Globe
} from "lucide-react";

const navByRole = {
  Admin: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin?tab=users" },
      ]
    },
    {
      group: "Management",
      items: [
        { label: "Users", icon: Users, path: "/admin?tab=users" },
        { label: "Vendors", icon: Building2, path: "/admin?tab=vendors" },
        { label: "Create User", icon: UserPlus, path: "/admin?tab=create-user" },
      ]
    },
    {
      group: "Analytics",
      items: [
        { label: "Reports", icon: TrendingUp, path: "/admin?tab=reports" },
        { label: "Activity", icon: Activity, path: "/admin?tab=reports" },
      ]
    },
  ],
  Vendor: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/vendor?tab=overview" },
      ]
    },
    {
      group: "Operations",
      items: [
        { label: "Purchase Orders", icon: ShoppingCart, path: "/vendor?tab=orders" },
        { label: "Invoices", icon: Receipt, path: "/vendor?tab=invoices" },
        { label: "Contracts", icon: FileText, path: "/vendor?tab=contracts" },
      ]
    },
  ],
  ProcurementOfficer: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/procurement?tab=vendors" },
      ]
    },
    {
      group: "Procurement",
      items: [
        { label: "Vendors", icon: Truck, path: "/procurement?tab=vendors" },
        { label: "Contracts", icon: FileText, path: "/procurement?tab=contracts" },
        { label: "Purchase Orders", icon: ShoppingCart, path: "/procurement?tab=purchase-orders" },
      ]
    },
    {
      group: "Monitoring",
      items: [
        { label: "Delayed POs", icon: AlertTriangle, path: "/procurement?tab=delays" },
      ]
    },
  ],
  WarehouseManager: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/warehouse?tab=incoming" },
      ]
    },
    {
      group: "Warehouse",
      items: [
        { label: "Incoming Deliveries", icon: Package, path: "/warehouse?tab=incoming" },
        { label: "Inventory", icon: Warehouse, path: "/warehouse?tab=inventory" },
        { label: "Goods Receipts", icon: ClipboardList, path: "/warehouse?tab=receipts" },
        { label: "Item Issues", icon: ArrowUpDown, path: "/warehouse?tab=issues" },
      ]
    },
  ],
  FinanceOfficer: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/finance?tab=invoices" },
      ]
    },
    {
      group: "Finance",
      items: [
        { label: "Invoices", icon: Receipt, path: "/finance?tab=invoices" },
        { label: "Payment History", icon: CreditCard, path: "/finance?tab=payments" },
        { label: "Spending Report", icon: TrendingUp, path: "/finance?tab=spending" },
      ]
    },
  ],
  ComplianceOfficer: [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/compliance?tab=overview" },
      ]
    },
    {
      group: "Compliance",
      items: [
        { label: "Vendors", icon: Truck, path: "/compliance?tab=vendors" },
        { label: "Contracts", icon: FileText, path: "/compliance?tab=contracts" },
        { label: "Purchase Orders", icon: ClipboardCheck, path: "/compliance?tab=orders" },
        { label: "Invoices", icon: Receipt, path: "/compliance?tab=invoices" },
      ]
    },
    {
      group: "Audit",
      items: [
        { label: "Inventory Issues", icon: Warehouse, path: "/compliance?tab=inventory" },
        { label: "Audit Log", icon: AlertTriangle, path: "/compliance?tab=audit-log" },
        { label: "Overview", icon: ShieldCheck, path: "/compliance?tab=overview" },
      ]
    },
  ],
};

const roleConfig = {
  Admin:               { color: "text-red-400",    bg: "bg-red-400/10",    label: "Administrator" },
  Vendor:              { color: "text-blue-400",   bg: "bg-blue-400/10",   label: "Vendor" },
  ProcurementOfficer:  { color: "text-purple-400", bg: "bg-purple-400/10", label: "Procurement" },
  WarehouseManager:    { color: "text-teal-400",   bg: "bg-teal-400/10",   label: "Warehouse" },
  FinanceOfficer:      { color: "text-green-400",  bg: "bg-green-400/10",  label: "Finance" },
  ComplianceOfficer:   { color: "text-orange-400", bg: "bg-orange-400/10", label: "Compliance" },
};

const roleRoutes = {
  Admin:               "/admin",
  Vendor:              "/vendor",
  ProcurementOfficer:  "/procurement",
  WarehouseManager:    "/warehouse",
  FinanceOfficer:      "/finance",
  ComplianceOfficer:   "/compliance",
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const groups = navByRole[user?.role ?? ""] ?? [];
  const config = roleConfig[user?.role ?? ""] ?? {
    color: "text-gray-400", bg: "bg-gray-400/10", label: "User"
  };
  const baseRoute = roleRoutes[user?.role ?? ""] ?? "/";

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) => {
    const [pathname, search] = path.split("?");
    const tab = new URLSearchParams(search).get("tab");
    const currentTab = new URLSearchParams(location.search).get("tab");
    return location.pathname === pathname && currentTab === tab;
  };

  return (
    <aside className="w-72 min-h-screen bg-sidebar flex flex-col
                      border-r border-white/5 relative">

      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1
                      bg-gradient-to-r from-primary-600 via-primary-400
                      to-primary-600" />

      {/* ── Brand ── */}
      <div className="px-6 pt-7 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary-600
                          flex items-center justify-center shrink-0
                          shadow-lg shadow-primary-600/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight leading-none">
              Supply<span className="text-primary-400">Sync</span>
            </h2>
            <p className="text-white/30 text-xs mt-0.5 tracking-wider">
              v2.0 Enterprise
            </p>
          </div>
        </div>

        {/* User card */}
        <div
          onClick={() => navigate(`${baseRoute}/profile`)}
          className="flex items-center gap-3 p-3 rounded-xl
                     bg-white/5 border border-white/5
                     hover:bg-white/10 cursor-pointer
                     transition-colors group">
          <div className={`w-9 h-9 rounded-xl ${config.bg}
                          flex items-center justify-center
                          text-sm font-bold ${config.color} shrink-0`}>
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-none">
              {user?.fullName}
            </p>
            <span className={`text-xs font-medium mt-1 inline-block
                              px-1.5 py-0.5 rounded-md ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20
                                   group-hover:text-white/50 transition-colors" />
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5
                      scrollbar-thin scrollbar-track-transparent
                      scrollbar-thumb-white/10">
        {groups.map(({ group, items }) => (
          <div key={group}>
            <p className="text-white/20 text-xs font-semibold uppercase
                          tracking-widest px-3 mb-2">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map(({ label, icon: Icon, path }) => {
                const active = isActive(path);
                return (
                  <NavLink key={label} to={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                                text-sm font-medium transition-all duration-150
                                group relative
                                ${active
                                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                                  : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2
                                       w-0.5 h-5 bg-white rounded-r-full" />
                    )}
                    <div className={`w-7 h-7 rounded-lg flex items-center
                                     justify-center shrink-0 transition-colors
                                     ${active
                                       ? "bg-white/20"
                                       : "bg-white/5 group-hover:bg-white/10"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1">{label}</span>
                    {active && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Quick Actions ── */}
      <div className="px-3 pb-3 border-t border-white/5 pt-3">
        <p className="text-white/20 text-xs font-semibold uppercase
                      tracking-widest px-3 mb-2">
          Quick Access
        </p>
        <div className="space-y-0.5">
          <NavLink to={`${baseRoute}/notifications`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-white/50 hover:text-white hover:bg-white/5
                       text-sm font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-white/5
                            group-hover:bg-white/10 flex items-center
                            justify-center shrink-0 transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </div>
            Notifications
          </NavLink>

          <NavLink to={`${baseRoute}/profile`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-white/50 hover:text-white hover:bg-white/5
                       text-sm font-medium transition-all group">
            <div className="w-7 h-7 rounded-lg bg-white/5
                            group-hover:bg-white/10 flex items-center
                            justify-center shrink-0 transition-colors">
              <User className="w-3.5 h-3.5" />
            </div>
            My Profile
          </NavLink>
        </div>
      </div>

      {/* ── Logout ── */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                     text-red-400/70 hover:text-red-400 hover:bg-red-400/10
                     text-sm font-medium transition-all group">
          <div className="w-7 h-7 rounded-lg bg-red-400/5
                          group-hover:bg-red-400/10 flex items-center
                          justify-center shrink-0 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
