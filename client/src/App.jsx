import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import HomeLayout from "./layouts/HomeLayout"
import HomePage from "./pages/HomePage"
import SheetManager from "./pages/SheetManager"
import { Route, Routes } from "react-router-dom"
function App() {

  return (
    <>
    <Routes>
        <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
             <Route path="/sheet" element={<SheetManager />} />
        </Route>
    </Routes>
    </>
  )
}

export default App
