import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";
import { Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleRoutes = {
    Admin: "/admin",
    Vendor: "/vendor",
    ProcurementOfficer: "/procurement",
    WarehouseManager: "/warehouse",
    FinanceOfficer: "/finance",
    ComplianceOfficer: "/compliance",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      const userData = res.data;
      login(userData);
      toast.success(`Welcome back, ${userData.fullName}!`);
      navigate(roleRoutes[userData.role] ?? "/");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your details.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Half ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative
                      flex-col items-center justify-center p-12 overflow-hidden">

        {/* Background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full
                        bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full
                        bg-primary-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full
                        border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] rounded-full
                        border border-white/5" />

        {/* Logo */}
        <div className="relative z-10 text-center mb-12">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
            Supply<span className="text-primary-400">Sync</span>
          </h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">
            Supply Chain Intelligence
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4 w-full max-w-sm">
          {[
            {
              icon: "🏭",
              title: "Vendor Management",
              desc: "Onboard, approve and manage vendors seamlessly"
            },
            {
              icon: "📦",
              title: "Inventory Control",
              desc: "Real-time stock tracking and automated alerts"
            },
            {
              icon: "📄",
              title: "Smart Invoicing",
              desc: "Three-way matching with GR verification"
            },
            {
              icon: "🛡️",
              title: "Compliance Audits",
              desc: "Full audit trail across every transaction"
            },
          ].map(({ icon, title, desc }) => (
            <div key={title}
              className="flex items-center gap-4 p-4 rounded-xl
                         bg-white/5 border border-white/10
                         hover:bg-white/10 transition-colors">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Right Half ── */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-white
                      flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Supply<span className="text-primary-600">Sync</span>
            </h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={e => {
                      setError("");
                      setForm({ ...form, email: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    className="input-field pl-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => {
                      setError("");
                      setForm({ ...form, password: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50
                                border border-red-200 rounded-lg">
                  <div className="w-4 h-4 rounded-full bg-red-500
                                  flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                  : "Sign In"
                }
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100
                            text-center text-sm text-gray-400">
              Are you a vendor?{" "}
              <Link to="/register/vendor"
                className="text-primary-600 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;