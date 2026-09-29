import { Outlet } from "react-router-dom";
import "./AdminLayout.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Header />

        <main className=" app-content">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
