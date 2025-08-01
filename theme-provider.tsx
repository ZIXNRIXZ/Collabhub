import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'collabhub-ui-theme',
  ...props
}: ThemeProviderProps) {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Sync with zustand store
  useEffect(() => {
    if (isDarkMode && theme !== 'dark') {
      setTheme('dark');
    } else if (!isDarkMode && theme !== 'light') {
      setTheme('light');
    }
  }, [isDarkMode, theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
      
      // Update zustand store
      if (theme === 'dark' && !isDarkMode) {
        toggleDarkMode();
      } else if (theme === 'light' && isDarkMode) {
        toggleDarkMode();
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};