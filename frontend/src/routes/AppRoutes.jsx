import { Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import CashRegister from "../pages/CashRegister";
import SalesHistory from "../pages/SalesHistory";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/caja" element={<CashRegister />} />
        <Route path="/ventas" element={<SalesHistory />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
