import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import HomeLayout from "./layouts/HomeLayout"
import HomePage from "./pages/HomePage"
import SheetManager from "./pages/SheetManager"
import { Route, Routes } from "react-router-dom"
import StudentsList from "./pages/StudentsList"
import TimeTable from "./pages/TimeTable"
import NotFound404 from "./pages/NotFound404"
import Loader from "./components/Loader"
function App() {

  return (
    <>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sheet" element={<SheetManager />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/timetable" element={<TimeTable />} />

          <Route path="/load" element={<Loader/>} />
          <Route path="*" element={<NotFound404 />} />
        </Route>


      </Routes>
    </>
  )
}

export default App
