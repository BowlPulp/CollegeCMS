import AdminNavbar from '../components/admin/AdminNavbar';
import Footer from '../components/Footer';
import HomeLayout from './HomeLayout';
import { Outlet } from 'react-router-dom';

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <HomeLayout>
        {children || <Outlet />}
      </HomeLayout>
      <Footer />
    </>
  );
} 