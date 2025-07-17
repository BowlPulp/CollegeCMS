import { createContext, useState, useContext, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('blindtext-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-ocean', 'theme-forest');
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('blindtext-theme', theme);
  }, [theme]);

  const themes = {
    default: {
      name: 'Default',
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
    },
    ocean: {
      name: 'Ocean',
      colors: {
        primary: '#1A374D',
        secondary: '#406882',
        accent: '#6998AB',
        neutral: '#B1D0E0'
      }
    },
    forest: {
      name: 'Forest',
      colors: {
        primary: '#1B4332',
        secondary: '#2D6A4F',
        accent: '#D8F3DC',
        neutral: '#F1FAEE'
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
