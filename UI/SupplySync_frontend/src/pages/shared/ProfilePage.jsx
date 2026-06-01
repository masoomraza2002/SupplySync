import { useAuth } from "../../context/AuthContext";
import { User, Mail, Shield, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors = {
    Admin:               "bg-red-100 text-red-700",
    Vendor:              "bg-blue-100 text-blue-700",
    ProcurementOfficer:  "bg-purple-100 text-purple-700",
    WarehouseManager:    "bg-teal-100 text-teal-700",
    FinanceOfficer:      "bg-green-100 text-green-700",
    ComplianceOfficer:   "bg-orange-100 text-orange-700",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="page-title">My Profile</h1>

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-6
                        border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-primary-600
                          flex items-center justify-center text-white
                          text-3xl font-bold shadow-lg">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.fullName}
            </h2>
            <span className={`text-xs font-semibold px-3 py-1
                              rounded-full mt-1 inline-block
              ${roleColors[user.role] ?? "bg-gray-100 text-gray-600"}`}>
              {user.role.replace(/([A-Z])/g, " $1").trim()}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50
                          rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="font-semibold text-gray-800">{user.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50
                          rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50
                          rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Role</p>
              <p className="font-semibold text-gray-800">
                {user.role.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50
                          rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">User ID</p>
              <p className="font-semibold text-gray-800 font-mono text-sm">
                {user.userId}
              </p>
            </div>
          </div>

          {user.vendorId && (
            <div className="flex items-center gap-4 p-4
                            bg-blue-50 rounded-xl border border-blue-100">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-400">Vendor ID</p>
                <p className="font-semibold text-blue-800">
                  #{user.vendorId}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;