import { createContext, useState, useContext, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // default theme

  useEffect(() => {
    const savedTheme = localStorage.getItem('blindtext-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const themes = {
    light: {
      name: 'Light',
      colors: {
        primary: '#ffffff',      // Clean white background
        secondary: '#f1f5f9',    // Light gray/blue
        accent: '#E21E23',       // Modern indigo
        neutral: '#0f172a'       // Dark slate for text
      }
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#121212',      // Dark background
        secondary: '#282828',    // Darker gray
        accent: '#E21E23',       // Purple accent
        neutral: '#F5F5F5'       // Light text
      }
    }
  };

  useEffect(() => {
    // Remove both possible classes before setting new one
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Update CSS custom properties
    const root = document.documentElement;
    const colors = themes[theme].colors;
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--neutral', colors.neutral);
    
    localStorage.setItem('blindtext-theme', theme);
  }, [theme]);

  const currentColors = useMemo(() => themes[theme].colors, [theme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        themes,
        currentColors
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
