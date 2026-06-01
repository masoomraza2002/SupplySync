import {
  Mail, Phone, MapPin,
  Globe, Shield, FileText, Truck, Warehouse, Receipt,
  ClipboardCheck, BarChart3, Heart
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight mb-3">
              Supply<span className="text-primary-400">Sync</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">
              SupplySync is an end-to-end supply chain management platform
              built for modern enterprises. Streamline vendor onboarding,
              procurement, inventory, invoicing, and compliance — all in one place.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>support@supplysync.io</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Chennai, Tamil Nadu, India — 600001</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Globe className="w-4 h-4 text-primary-400 shrink-0" />
                <span>www.supplysync.io</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase
                           tracking-widest mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Truck, label: "Vendor Management" },
                { icon: FileText, label: "Contract Management" },
                { icon: BarChart3, label: "Purchase Orders" },
                { icon: Warehouse, label: "Inventory Control" },
                { icon: Receipt, label: "Invoice Processing" },
                { icon: ClipboardCheck, label: "Compliance Audits" },
                { icon: Shield, label: "Role-Based Access" },
              ].map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a href="#"
                    className="flex items-center gap-2 text-white/50
                               hover:text-white text-sm transition-colors group">
                    <Icon className="w-3.5 h-3.5 text-primary-400
                                     group-hover:text-primary-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase
                           tracking-widest mb-5">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                "Documentation", "API Reference", "Release Notes",
                "System Status", "Changelog", "Integration Guide",
                "Video Tutorials", "Community Forum",
              ].map(label => (
                <li key={label}>
                  <a href="#"
                    className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase
                           tracking-widest mb-5">
              Company
            </h3>
            <ul className="space-y-3 mb-8">
              {[
                "About Us", "Careers", "Press Kit",
                "Blog", "Partners", "Contact Sales",
              ].map(label => (
                <li key={label}>
                  <a href="#"
                    className="text-white/50 hover:text-white text-sm transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row
                        items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {currentYear} SupplySync Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-white/20 text-xs flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400 mx-0.5" /> in India
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map(label => (
              <a key={label} href="#"
                className="text-white/30 hover:text-white/60 text-xs transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
