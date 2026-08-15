import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/admin/products')) return 'Mahsulotlar boshqaruvi';
    if (location.pathname.includes('/admin/users')) return 'Foydalanuvchilar boshqaruvi';
    if (location.pathname.includes('/admin/orders')) return 'Buyurtmalar boshqaruvi';
    return 'Admin Dashboard';
  };

  const initial = user
    ? user.first_name
      ? user.first_name[0].toUpperCase()
      : user.email[0].toUpperCase()
    : 'A';

  const fullName = user
    ? user.first_name || user.last_name
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : user.email
    : 'Administrator';

  return (
    <div className="admin-wrapper">
      {/* Chap menyu */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            NEXORA <span className="admin-brand-tag">Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">🛍️</span>
            <span>Mahsulotlar</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📦</span>
            <span>Buyurtmalar</span>
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Foydalanuvchilar</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <span>v1.0.0</span>
          <span>Nexora Store</span>
        </div>
      </aside>

      {/* O'ng tomon */}
      <div className="admin-main-container">
        <header className="admin-header">
          <h1 className="admin-header-title">{getPageTitle()}</h1>

          <div className="admin-header-user">
            <div className="admin-avatar">{initial}</div>
            <div className="admin-user-info">
              <span className="admin-user-name">{fullName}</span>
              <span className="admin-user-role">{user?.role || 'Admin'}</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                marginLeft: '12px',
                padding: '6px 12px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              title="Chiqish"
            >
              Chiqish 🚪
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
