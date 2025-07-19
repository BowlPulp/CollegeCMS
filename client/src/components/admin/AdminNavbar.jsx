import { useState } from 'react';
import { Sun, Moon, UserCircle, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminNavbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleProfile = () => setProfileOpen((v) => !v);
  const closeProfile = () => setProfileOpen(false);
  const handleLogout = async () => {
    await logout();
    closeProfile();
    navigate('/');
  };
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  return (
    <nav className="bg-[var(--primary)] text-[var(--neutral)] shadow-md w-full fixed z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-[var(--accent)] font-bold text-xl">Admin Panel</span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/home" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Home</Link>
          <Link to="/admin/manage-students" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Manage Students</Link>
          <Link to="/admin/manage-teachers" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Manage Teachers</Link>
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
          {/* Profile Dropdown */}
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
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]"
                  >Profile</button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-red-500"
                  >Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Sun className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            ) : (
              <Moon className="h-5 w-5 text-[var(--neutral)] hover:text-[var(--accent)] transition-colors duration-300" />
            )}
          </button>
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-[var(--neutral)] hover:bg-[var(--secondary)]"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Nav Links */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--primary)]">
            <Link to="/home" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Home</Link>
            <Link to="/admin/manage-students" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Manage Students</Link>
            <Link to="/admin/manage-teachers" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Manage Teachers</Link>
            <button
              onClick={toggleTheme}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]"
            >
              {theme === 'light' ? 'Dark Theme' : 'Light Theme'}
            </button>
            <button
              onClick={() => { closeProfile(); navigate('/profile'); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]"
            >Profile</button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-red-500"
            >Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
} 