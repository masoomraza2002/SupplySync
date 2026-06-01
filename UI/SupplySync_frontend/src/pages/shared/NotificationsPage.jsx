import { useState, useEffect } from "react";
import { notificationApi } from "../../api/notificationApi";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { Bell, CheckCheck, Circle } from "lucide-react";
import toast from "react-hot-toast";

const typeColors = {
  VendorRegistration: "bg-blue-100 text-blue-700",
  VendorStatusUpdate: "bg-green-100 text-green-700",
  VendorSuspended:    "bg-red-100 text-red-700",
  ContractCreated:    "bg-purple-100 text-purple-700",
  POCreated:          "bg-indigo-100 text-indigo-700",
  GoodsReceived:      "bg-teal-100 text-teal-700",
  GoodsReceiptIssue:  "bg-orange-100 text-orange-700",
  InvoiceSubmitted:   "bg-yellow-100 text-yellow-700",
  InvoiceReviewed:    "bg-green-100 text-green-700",
  PaymentProcessed:   "bg-emerald-100 text-emerald-700",
  ComplianceFail:     "bg-red-100 text-red-700",
  LowStockAlert:      "bg-orange-100 text-orange-700",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getMine();
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="page-title mb-0">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold
                             rounded-full px-2 py-0.5">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="card flex flex-col items-center py-16 text-gray-400">
              <Bell className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No notifications yet.</p>
            </div>
          )}
          {notifications.map(n => (
            <div key={n.id}
              className={`card flex items-start gap-4 cursor-pointer
                          transition-all duration-150
                          ${!n.isRead
                            ? "border-primary-200 bg-primary-50"
                            : "bg-white"}`}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}>
              <div className="mt-0.5">
                {n.isRead
                  ? <Circle className="w-3 h-3 text-gray-300" />
                  : <Circle className="w-3 h-3 text-primary-600 fill-primary-600" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-sm ${!n.isRead
                    ? "font-semibold text-gray-900"
                    : "text-gray-600"}`}>
                    {n.message}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full
                                   whitespace-nowrap shrink-0
                    ${typeColors[n.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {n.type.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;