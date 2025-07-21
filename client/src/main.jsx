import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import './styles/theme.css';
import ScrollToTop from './components/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* <AuthProvider> */}
  <ThemeProvider>
    <App />
    <ScrollToTop/>
  </ThemeProvider>
    {/* </AuthProvider> */}
  </BrowserRouter>,
)
