import { useState } from 'react';
import { Menu, X, ChevronDown, Sun, Moon, UserCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false); // Separate state for desktop resources
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setProfileOpen((v) => !v);
  const toggleResources = () => setResourcesOpen((v) => !v); // Desktop resources toggle
  const toggleMobileResources = () => setMobileResourcesOpen((v) => !v);
  const closeProfile = () => setProfileOpen(false);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setResourcesOpen(false);
    setMobileResourcesOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
    closeProfile();
    navigate('/login');
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="bg-[var(--primary)] text-[var(--neutral)] shadow-md w-full fixed z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-[var(--accent)] font-bold text-xl">ChitkaraCMS</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            to="/" 
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            to='/students' 
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            Students List
          </Link>
          <Link 
            to='/timetable' 
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            Time Table
          </Link>
          <Link 
            to='/duties' 
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            Duty
          </Link>
          
          {/* Admin Panel button for admin */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin/home" 
              className="px-3 py-2 rounded-md text-sm font-medium bg-[var(--accent)] text-[var(--primary)] hover:bg-[var(--accent)]/90 transition-colors duration-200"
            >
              Admin Panel
            </Link>
          )}
          
          {/* Resources Dropdown */}
          <div className="relative inline-block text-left">
            <button
              onClick={toggleResources}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] inline-flex items-center transition-colors duration-200"
            >
              Resources
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
            </button>
            {resourcesOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--secondary)] ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  <Link 
                    to="/sheet" 
                    className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200"
                    onClick={() => setResourcesOpen(false)}
                  >
                    Sheets
                  </Link>
                  <Link 
                    to="/chos" 
                    className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200"
                    onClick={() => setResourcesOpen(false)}
                  >
                    CHOs
                  </Link>
                  <Link 
                    to="/event-news" 
                    className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200"
                    onClick={() => setResourcesOpen(false)}
                  >
                    Event News
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Theme + Auth/Profile buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Current theme: ${theme === 'light' ? 'Light' : 'Dark'}`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            ) : (
              <Sun className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            )}
          </button>
          
          {/* Profile Dropdown if authed, else Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="p-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center transition-all duration-300"
                aria-label="Profile"
              >
                <UserCircle className="h-7 w-7 text-[var(--accent)]" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[var(--secondary)] ring-1 ring-black ring-opacity-5 z-30">
                  <div className="py-1">
                    <button
                      onClick={() => { closeProfile(); navigate('/profile'); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-red-500 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm transition-colors duration-200"
            >
              Log in
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            ) : (
              <Sun className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            )}
          </button>
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-[var(--neutral)] hover:bg-[var(--secondary)] transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--primary)]">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              onClick={closeMenus}
            >
              Home
            </Link>
            <Link 
              to='/students' 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              onClick={closeMenus}
            >
              Students List
            </Link>
            <Link 
              to='/timetable' 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              onClick={closeMenus}
            >
              Time Table
            </Link>
            <Link 
              to='/duties' 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              onClick={closeMenus}
            >
              Duty
            </Link>
            
            {/* Admin Panel for mobile */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin/home" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-[var(--accent)] text-[var(--primary)] hover:bg-[var(--accent)]/90 transition-colors duration-200"
                onClick={closeMenus}
              >
                Admin Panel
              </Link>
            )}
            
            {/* Mobile Resources Dropdown */}
            <div>
              <button
                onClick={toggleMobileResources}
                className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] transition-colors duration-200"
              >
                Resources
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${mobileResourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mobile Resources Submenu */}
              {mobileResourcesOpen && (
                <div className="ml-4 space-y-1 mt-1">
                  <Link 
                    to="/sheet" 
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] text-[var(--neutral)]/80 transition-colors duration-200"
                    onClick={closeMenus}
                  >
                    Sheets
                  </Link>
                  <Link 
                    to="/chos" 
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] text-[var(--neutral)]/80 transition-colors duration-200"
                    onClick={closeMenus}
                  >
                    CHOs
                  </Link>
                  <Link 
                    to="/event-news" 
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] text-[var(--neutral)]/80 transition-colors duration-200"
                    onClick={closeMenus}
                  >
                    Event News
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="pt-4 pb-3 border-t border-[var(--secondary)]">
              {user ? (
                <div className="px-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <UserCircle className="h-8 w-8 text-[var(--accent)]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--neutral)]">
                        {user?.name || 'User'}
                      </span>
                      <span className="text-xs text-[var(--neutral)]/70">
                        {user?.email || user?.role || 'Member'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { 
                        closeMenus(); 
                        navigate('/profile'); 
                      }}
                      className="flex-1 px-3 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        closeMenus();
                        handleLogout();
                      }}
                      className="flex-1 px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 font-medium text-sm transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3">
                  <Link 
                    to="/login" 
                    className="block w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm text-center transition-colors duration-200"
                    onClick={closeMenus}
                  >
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
