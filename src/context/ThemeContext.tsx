import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const eye = localStorage.getItem('sov_eye_theme_v1');
      if (eye === 'day' || eye === 'hc') return 'light';
      if (eye === 'night') return 'dark';
      const saved = localStorage.getItem('prism-theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('prism-theme', theme); } catch {}
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
