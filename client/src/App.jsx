import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import HomeLayout from "./layouts/HomeLayout"
import HomePage from "./pages/HomePage"
import SheetManager from "./pages/SheetManager"
import { Route, Routes, Navigate } from "react-router-dom"
import StudentsList from "./pages/StudentsList"
import TimeTable from "./pages/TimeTable"
import NotFound404 from "./pages/NotFound404"
import Loader from "./components/Loader"
import LoginPage from "./pages/LoginPage"
import useAuthStore from "./store/authStore"
import AdminHome from "./pages/admin/AdminHome"
import Profile from "./pages/Profile";

// PrivateRoute for role-based protection
function PrivateRoute({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to home or a not-authorized page
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sheet" element={<SheetManager />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path='/login' element={<LoginPage/>}/>
          <Route path="/load" element={<Loader/>} />
          <Route path="/profile" element={
            <PrivateRoute allowedRoles={["admin", "teacher"]}>
              <Profile />
            </PrivateRoute>
          } />
          {/* Admin-only route */}
          <Route path="/admin/home" element={
            <PrivateRoute allowedRoles={"admin"}>
              <AdminHome/>
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound404 />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
