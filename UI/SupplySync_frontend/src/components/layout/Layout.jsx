import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const Layout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Topbar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
      <Footer />
    </div>
  </div>
);

export default Layout;
