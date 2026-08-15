import React from 'react';
import { Navigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    return <Navigate to="/" replace />;
  }

  try {
    const user: User = JSON.parse(savedUser);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
