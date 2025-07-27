import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import HomeLayout from "./layouts/HomeLayout"
import HomePage from "./pages/HomePage"
import SheetManager from "./pages/SheetManager"
import { Route, Routes, Navigate, Outlet } from "react-router-dom"
import StudentsList from "./pages/StudentsList"
import TimeTable from "./pages/TimeTable"
import NotFound404 from "./pages/NotFound404"
import Loader from "./components/Loader"
import LoginPage from "./pages/LoginPage"
import useAuthStore from "./store/authStore"
import Profile from "./pages/Profile"
import AdminLayout from "./layouts/AdminLayout"
import ManageStudents from "./pages/admin/ManageStudents"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import EventNewsPage from "./pages/EventNewsPage"
import ChoPage from "./pages/ChoPage"

// PrivateRoute for role-based protection
function PrivateRoute({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

// Layout that only renders children if user is logged in
function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/" replace />;
  return (
    <>
      <Navbar />
      <HomeLayout>
        <Outlet />
      </HomeLayout>
      <Footer />
    </>
  );
}

function App() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading); // get loading state

  // Show loading spinner while session is restoring
  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Login page at /, only for unauthenticated users */}
      <Route path="/" element={
        !user ? <LoginPage /> : <Navigate to="/home" replace />
      } />
      <Route path="/reset" element={<ResetPasswordPage />} />
      
      {/* Admin routes with AdminNavbar */}
      <Route element={<PrivateRoute allowedRoles={["admin"]}><AdminLayout /></PrivateRoute>}>
        <Route path="/admin/home" element={<HomePage />} />
        <Route path="/admin/manage-students" element={<ManageStudents />} />
        <Route path="/admin/manage-teachers" element={<div className='p-8 text-center text-xl'>Manage Teachers (Admin Only)</div>} />
      </Route>

      {/* All authenticated routes with normal Navbar */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/sheet" element={<SheetManager />} />
        <Route path="/students" element={<StudentsList />} />
        <Route path="/timetable" element={<TimeTable />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/load" element={<Loader />} />
        <Route path="/event-news" element={<EventNewsPage />} />
        <Route path="/chos" element={<ChoPage />} />
      </Route>

      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}

export default App;
