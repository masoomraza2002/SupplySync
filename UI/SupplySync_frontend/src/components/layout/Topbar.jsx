import {
  Bell, ChevronDown, LogOut, User, Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { notificationApi } from "../../api/notificationApi";

const roleRoutes = {
  Admin:               "/admin",
  Vendor:              "/vendor",
  ProcurementOfficer:  "/procurement",
  WarehouseManager:    "/warehouse",
  FinanceOfficer:      "/finance",
  ComplianceOfficer:   "/compliance",
};

const roleConfig = {
  Admin:               { color: "text-red-600",    bg: "bg-red-50",    label: "Administrator" },
  Vendor:              { color: "text-blue-600",   bg: "bg-blue-50",   label: "Vendor" },
  ProcurementOfficer:  { color: "text-purple-600", bg: "bg-purple-50", label: "Procurement Officer" },
  WarehouseManager:    { color: "text-teal-600",   bg: "bg-teal-50",   label: "Warehouse Manager" },
  FinanceOfficer:      { color: "text-green-600",  bg: "bg-green-50",  label: "Finance Officer" },
  ComplianceOfficer:   { color: "text-orange-600", bg: "bg-orange-50", label: "Compliance Officer" },
};

const pageTitles = {
  "/admin":       "Admin Dashboard",
  "/vendor":      "Vendor Dashboard",
  "/procurement": "Procurement Dashboard",
  "/warehouse":   "Warehouse Dashboard",
  "/finance":     "Finance Dashboard",
  "/compliance":  "Compliance Dashboard",
};

const breadcrumbMap = {
  "users":           "Users",
  "vendors":         "Vendors",
  "create-user":     "Create User",
  "reports":         "Reports",
  "overview":        "Overview",
  "orders":          "Purchase Orders",
  "invoices":        "Invoices",
  "contracts":       "Contracts",
  "purchase-orders": "Purchase Orders",
  "delays":          "Delayed POs",
  "incoming":        "Incoming Deliveries",
  "inventory":       "Inventory",
  "receipts":        "Goods Receipts",
  "issues":          "Item Issues",
  "payments":        "Payment History",
  "spending":        "Spending Report",
  "audit-log":       "Audit Log",
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const baseRoute = roleRoutes[user?.role ?? ""] ?? "/";
  const config = roleConfig[user?.role ?? ""] ?? {
    color: "text-gray-600", bg: "bg-gray-50", label: "User"
  };

  const pageTitle = pageTitles[location.pathname] ?? "SupplySync";
  const currentTab = new URLSearchParams(location.search).get("tab");
  const tabLabel = currentTab ? breadcrumbMap[currentTab] : null;

  useEffect(() => {
    notificationApi.getUnreadCount()
      .then(res => setUnread(res.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setProfileOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100
                       flex items-center justify-between px-6
                       sticky top-0 z-40 shadow-sm">

      {/* ── Left: Brand + Breadcrumb ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(baseRoute)}
          className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary-600
                          flex items-center justify-center
                          shadow-md shadow-primary-600/20
                          group-hover:shadow-primary-600/40
                          transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base hidden sm:block">
            Supply<span className="text-primary-600">Sync</span>
          </span>
        </button>

        <span className="text-gray-200 text-lg font-light hidden md:block">/</span>

        <div className="hidden md:flex items-center gap-1.5 text-sm">
          <span className="text-gray-400 font-medium">{pageTitle}</span>
          {tabLabel && (
            <>
              <span className="text-gray-200">/</span>
              <span className="text-gray-700 font-semibold">{tabLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1.5">

        {/* Notifications */}
        <button
          onClick={() => navigate(`${baseRoute}/notifications`)}
          className="relative p-2 rounded-xl hover:bg-gray-100
                     transition-colors text-gray-400 hover:text-gray-600">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4
                             bg-red-500 text-white text-xs rounded-full
                             flex items-center justify-center font-bold
                             px-0.5 leading-none ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5
                       rounded-xl hover:bg-gray-100 transition-colors group">
            <div className={`w-8 h-8 rounded-xl ${config.bg}
                            flex items-center justify-center
                            text-sm font-bold ${config.color} shrink-0`}>
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-none">
                {user?.fullName.split(" ")[0]}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-none">
                {config.label}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform
                                     ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64
                            bg-white rounded-2xl shadow-xl border border-gray-100
                            overflow-hidden z-50">

              <div className="p-4 bg-gradient-to-br from-gray-50 to-white
                              border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${config.bg}
                                  flex items-center justify-center
                                  text-lg font-bold ${config.color}`}>
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user?.email}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5
                                      rounded-full mt-1 inline-block
                                      ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {[
                  {
                    icon: User,
                    label: "My Profile",
                    sub: "View & edit profile",
                    badge: null,
                    action: () => { navigate(`${baseRoute}/profile`); setProfileOpen(false); }
                  },
                  {
                    icon: Bell,
                    label: "Notifications",
                    sub: unread > 0 ? `${unread} unread` : "All caught up",
                    badge: unread > 0 ? unread : null,
                    action: () => { navigate(`${baseRoute}/notifications`); setProfileOpen(false); }
                  }
                ].map(({ icon: Icon, label, sub, badge, action }) => (
                  <button key={label} onClick={action}
                    className="w-full flex items-center gap-3 px-3 py-2.5
                               rounded-xl hover:bg-gray-50 transition-colors
                               text-left group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100
                                    group-hover:bg-gray-200 flex items-center
                                    justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    {badge && (
                      <span className="bg-red-500 text-white text-xs
                                       rounded-full w-5 h-5 flex items-center
                                       justify-center font-bold shrink-0">
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-gray-100">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5
                             rounded-xl hover:bg-red-50 transition-colors
                             text-left group">
                  <div className="w-8 h-8 rounded-lg bg-red-50
                                  group-hover:bg-red-100 flex items-center
                                  justify-center shrink-0 transition-colors">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Sign Out</p>
                    <p className="text-xs text-red-400">End your session securely</p>
                  </div>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
