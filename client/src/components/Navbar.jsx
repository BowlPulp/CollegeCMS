import { useState } from 'react';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFeaturesClick = () => {
    if (location.pathname === '/') {
      const section = document.getElementById('features');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToFeatures: true } });
    }
  };

  const handleAboutClick = () => {
    if(location.pathname === '/'){
      const section = document.getElementById('about');
      if(section){
        section.scrollIntoView({behavior:'smooth'});
      }
    } else {
      navigate('/', {state:{ scrollToAbout: true}});
    }
  };

  return (
    <nav className="bg-[var(--primary)] text-[var(--neutral)] shadow-md w-full fixed z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-[var(--accent)] font-bold text-xl">ChitkaraCMS</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Home</a>
            <button onClick={handleFeaturesClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] cursor-pointer">Features</button>
            <button onClick={handleAboutClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] cursor-pointer">About</button>

            {/* Resources Dropdown */}
            <div className="relative inline-block text-left">
              <button
                onClick={toggleMenu}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] inline-flex items-center"
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--secondary)] ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <a href="/sheet" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Sheets</a>
                    <a href="/terms" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Terms of Service</a>
                    <a href="/privacy-policy" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Privacy Policy</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme + Auth buttons */}
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

            {isAuthenticated() ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm">Dashboard</Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm">Log in</Link>
              </>
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
      </div>

      {/* Mobile Nav Links */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--primary)]">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Home</Link>
            <button onClick={handleFeaturesClick} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Features</button>
            <button onClick={handleAboutClick} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">About</button>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Resources</a>

            <div className="pt-4 pb-3 border-t border-[var(--secondary)]">
              <div className="flex items-center px-5 space-x-2">
                {isAuthenticated() ? (
                  <>
                    <Link to="/dashboard" className="w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm">Dashboard</Link>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm">Log in</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
