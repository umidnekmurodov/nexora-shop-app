import { useEffect, useState } from 'react';
import { getUsers, updateUserStatus } from '../../api';
import './AdminUsers.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'superadmin' | string;
  is_active: boolean;
  created_at?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Foydalanuvchilarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleToggleStatus = async (user: User) => {
    if (user.role === 'admin' || user.role === 'superadmin') {
      return; // Admins cannot block each other
    }

    setUpdatingId(user.id);
    setError(null);
    setSuccessMsg(null);

    const nextStatus = !user.is_active;

    try {
      await updateUserStatus(user.id, nextStatus);
      const actionText = nextStatus ? 'faollashtirildi' : 'bloklandi';
      setSuccessMsg(`Foydalanuvchi (${user.email}) muvaffaqiyatli ${actionText}`);
      
      // Update local state directly for instant feedback
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      );
    } catch (err: any) {
      setError(err.message || 'Foydalanuvchi holatini o’zgartirishda xatolik yuz berdi');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(search) || email.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.is_active).length;
  const blockedUsersCount = users.filter((u) => !u.is_active).length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-users-container">
      {/* Alert notifications */}
      {error && (
        <div className="admin-alert admin-alert-error">
          <span>⚠️ {error}</span>
          <button className="admin-alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMsg && (
        <div className="admin-alert admin-alert-success">
          <span>✅ {successMsg}</span>
          <button className="admin-alert-close" onClick={() => setSuccessMsg(null)}>×</button>
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Jami foydalanuvchilar</span>
          <span className="admin-stat-value">{totalUsers}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Faol foydalanuvchilar</span>
          <span className="admin-stat-value" style={{ color: '#166534' }}>{activeUsersCount}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Bloklanganlar</span>
          <span className="admin-stat-value" style={{ color: '#dc2626' }}>{blockedUsersCount}</span>
        </div>
      </div>

      {/* Toolbar: Search & Role Filter */}
      <div className="admin-products-toolbar">
        <div className="admin-toolbar-search">
          <input
            type="text"
            className="admin-input-search"
            placeholder="Qidiruv (ism, familiya yoki email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-select-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Barcha rollar</option>
            <option value="customer">Mijozlar (Customer)</option>
            <option value="admin">Adminlar</option>
            <option value="superadmin">Superadminlar</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-card">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Foydalanuvchi</th>
                <th>Telefon</th>
                <th>Rol</th>
                <th>Holati</th>
                <th>Ro'yxatdan o'tgan sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="skeleton-row">
                    <td><div className="skeleton-box" style={{ width: '30px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '180px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '110px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '70px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '90px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '100px' }}></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">👥</div>
                      <h3>Hozircha foydalanuvchi topilmadi</h3>
                      <p>Qidiruv shartlariga mos keladigan foydalanuvchilar mavjud emas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initial = (u.first_name?.[0] || u.email[0] || 'U').toUpperCase();
                  const isAdminOrSuper = u.role === 'admin' || u.role === 'superadmin';

                  return (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-circle">{initial}</div>
                          <div className="user-info-meta">
                            <strong>
                              {u.first_name || u.last_name
                                ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
                                : 'Ismsiz foydalanuvchi'}
                            </strong>
                            <span className="user-email-text">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || '-'}</td>
                      <td>
                        <span className={`badge-role role-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.is_active ? (
                          <span className="badge-pill badge-status-active">Faol</span>
                        ) : (
                          <span className="badge-pill badge-status-blocked">Bloklangan</span>
                        )}
                      </td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        {isAdminOrSuper ? (
                          <button
                            className="admin-btn-disabled"
                            disabled
                            title="Adminlarni bloklab bo'lmaydi"
                          >
                            Himoyalangan
                          </button>
                        ) : (
                          <button
                            className={u.is_active ? 'admin-btn-block' : 'admin-btn-activate'}
                            onClick={() => handleToggleStatus(u)}
                            disabled={updatingId === u.id}
                          >
                            {updatingId === u.id
                              ? 'Bajarilmoqda...'
                              : u.is_active
                              ? 'Bloklash'
                              : 'Faollashtirish'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
