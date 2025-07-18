import { useState } from 'react';
import { Menu, X, ChevronDown, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleThemeMenu = () => setIsThemeMenuOpen(!isThemeMenuOpen);

  const themes = ['light', 'dark'];

  const themeColors = {
    light: '#4f46e5',
    dark: '#111827',
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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
            <a onClick={handleAboutClick} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)] cursor-pointer">About</a>

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
                    <a href="/contact" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Contact</a>
                    <a href="/terms" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Terms of Service</a>
                    <a href="/privacy-policy" className="block px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)]">Privacy Policy</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme + Auth buttons */}
<div className="hidden md:flex items-center space-x-2">
  {/* Theme Button */}
  <div className="relative">
    <button
      onClick={toggleThemeMenu}
      className="p-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center"
      aria-label="Select theme"
      title={`Current theme: ${capitalize(theme)}`}
    >
      <Palette className="h-5 w-5 text-[var(--neutral)]" />
    </button>

    {isThemeMenuOpen && (
      <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[var(--secondary)] ring-1 ring-black ring-opacity-5 z-20">
        <div className="py-1">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] ${
                theme === t ? 'bg-[var(--primary)] text-[var(--accent)]' : ''
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: themeColors[t] }}
              ></span>
              {capitalize(t)}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>

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
      {/* <Link to="/signup" className="px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--accent)] hover:bg-[var(--neutral)] font-medium text-sm">Sign up</Link> */}
    </>
  )}
</div>


          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* Mobile Theme Button */}
            <div className="relative">
              <button
                onClick={toggleThemeMenu}
                className="p-2 mr-2 rounded-full hover:bg-[var(--secondary)] flex items-center justify-center"
                aria-label="Select theme"
              >
                <Palette className="h-5 w-5 text-[var(--neutral)]" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-[var(--secondary)] ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    {themes.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary)] hover:text-[var(--accent)] ${
                          theme === t ? 'bg-[var(--primary)] text-[var(--accent)]' : ''
                        }`}
                      >
                        <div className="flex gap-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--primary-${t})` }}></span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--secondary-${t})` }}></span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--neutral-${t})` }}></span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `var(--accent-${t})` }}></span>
                        </div>
                        <span>{capitalize(t)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
            <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">About</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[var(--secondary)] hover:text-[var(--accent)]">Resources</a>

            <div className="pt-4 pb-3 border-t border-[var(--secondary)]">
              <div className="flex items-center px-5 space-x-2">
                <Link to="/login" className="w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--neutral)] hover:bg-[var(--accent)] font-medium text-sm">Log in</Link>
                {/* <Link to="/signup" className="w-full px-4 py-2 rounded-md text-[var(--primary)] bg-[var(--accent)] hover:bg-[var(--neutral)] font-medium text-sm">Sign up</Link> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
