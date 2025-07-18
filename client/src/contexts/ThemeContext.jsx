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

  useEffect(() => {
    // Remove both possible classes before setting new one
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('blindtext-theme', theme);
  }, [theme]);

  const themes = {
    light: {
      name: 'Light',
      colors: {
        primary: '#222831',
        secondary: '#393E46',
        accent: '#FFD369',
        neutral: '#EEEEEE'
      }
    },
    dark: {
      name: 'Dark',
      colors: {
        primary: '#121212',
        secondary: '#282828',
        accent: '#BB86FC',
        neutral: '#F5F5F5'
      }
    }
  };

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
