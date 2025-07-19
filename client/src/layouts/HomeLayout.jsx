import React from 'react';
import { Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function HomeLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className={`min-h-screen ${user ? 'pt-16' : ''}`}>
      {children || <Outlet />}
    </div>
  );
}

export default HomeLayout;
