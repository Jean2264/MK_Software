import { NavLink } from "react-router-dom";

import "./Sidebar.css";
import { useState } from "react";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const closeSidebar = () => {
    setIsCollapsed(true);
    setIsHovered(false);
  };
  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar-logo">
        <div className="logo-mark">MK</div>

        <span className="logo-name">Mi Kiosco</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end onClick={closeSidebar}>
          <i className="bi bi-house"></i>
          <span>Principal</span>
        </NavLink>

        <NavLink to="/caja" onClick={closeSidebar}>
          <i className="bi bi-cart3"></i>
          <span>Punto de venta</span>
        </NavLink>

        <NavLink to="/productos" onClick={closeSidebar}>
          <i className="bi bi-box-seam"></i>
          <span>Productos</span>
        </NavLink>

        <NavLink to="/ventas" onClick={closeSidebar}>
          <i className="bi bi-receipt"></i>
          <span>Ventas</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
