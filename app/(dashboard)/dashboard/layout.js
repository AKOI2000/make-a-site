import Sidebar from "./components/Sidebar/Sidebar";
import "./dashboard.scss";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard__main">
        <div className="dashboard__content">
          {children}
        </div>
      </main>
    </div>
  );
}