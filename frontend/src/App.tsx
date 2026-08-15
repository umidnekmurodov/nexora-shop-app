import { Navigate, Route, Routes } from "react-router-dom";
import Mainlayout from "./layout/Mainlayout";
import Home from "./components/home/Home";
import Mencard from "./components/men-woman/Mencard";
import Womancard from "./components/men-woman/Womancard";
import AuthPage from "./components/auth/AuthPage";
import AdminLayout from "./components/admin/Adminlayout";
import AdminProducts from "./components/admin/AdminProducts";
import AdminUsers from "./components/admin/AdminUsers";
import AdminRoute from "./components/admin/AdminRoute";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage initialTab="login" />} />
        <Route path="/register" element={<AuthPage initialTab="register" />} />

        {/* Asosiy layout */}
        <Route path="/" element={<Mainlayout />}>
          <Route index element={<Home />} />
          <Route path="Men" element={<Mencard />} />
          <Route path="Women" element={<Womancard />} />
        </Route>

        {/* Admin —  */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route
            path="orders"
            element={
              <div style={{ padding: '20px', background: '#fff', borderRadius: '12px' }}>
                Buyurtmalar bo'limi (Tez kunda)
              </div>
            }
          />
        </Route>
      </Routes>
    </CartProvider>
  );
}


