import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const THEME_STORAGE_KEY = 'leblanc.themePreference';

type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setPreference: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getStoredPreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
};

const getPreferredScheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => getStoredPreference());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const stored = getStoredPreference();
    return stored === 'system' ? getPreferredScheme() : stored;
  });

  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const getTheme = () => (preference === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : preference);

    const updateTheme = () => {
      const theme = getTheme();
      setResolvedTheme(theme);
      applyTheme(theme);
    };

    updateTheme();

    const handleChange = () => {
      if (preference === 'system') {
        updateTheme();
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [applyTheme, preference]);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);

    if (typeof window === 'undefined') return;

    if (value === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    }
  }, []);

  const value = useMemo(() => ({
    preference,
    resolvedTheme,
    setPreference,
  }), [preference, resolvedTheme, setPreference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export type { ThemePreference };
