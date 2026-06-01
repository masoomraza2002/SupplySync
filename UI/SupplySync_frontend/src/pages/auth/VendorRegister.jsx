import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";
import { Loader2, Building2 } from "lucide-react";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    contactPhone: "",
    address: "",
    taxNumber: "",
    licenseNumber: "",
    documentPath: "",
  });

  const set = (key, val) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.vendorRegister(form);
      toast.success("Registration submitted! Awaiting approval.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900
                    via-primary-800 to-sidebar flex items-center
                    justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Supply<span className="text-primary-300">Sync</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm">Vendor Registration Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Create Vendor Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" placeholder="John Doe"
                  value={form.fullName}
                  onChange={e => set("fullName", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input-field"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input className="input-field" placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={e => set("companyName", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Contact Phone</label>
                <input className="input-field" placeholder="+1 234 567 890"
                  value={form.contactPhone}
                  onChange={e => set("contactPhone", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Tax Number</label>
                <input className="input-field" placeholder="TAX-123456"
                  value={form.taxNumber}
                  onChange={e => set("taxNumber", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">License Number</label>
                <input className="input-field" placeholder="LIC-123456"
                  value={form.licenseNumber}
                  onChange={e => set("licenseNumber", e.target.value)}
                  required />
              </div>
              <div>
                <label className="label">Document Path / URL</label>
                <input className="input-field"
                  placeholder="https://docs.example.com/vendor-docs"
                  value={form.documentPath}
                  onChange={e => set("documentPath", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea className="input-field" rows={2}
                placeholder="123 Business St, City, Country"
                value={form.address}
                onChange={e => set("address", e.target.value)}
                required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : "Submit Registration"
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already registered?{" "}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;