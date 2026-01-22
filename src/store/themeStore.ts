import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      actualTheme: 'light',

      setTheme: (theme) => {
        let actualTheme: 'light' | 'dark' = 'light';

        if (theme === 'auto') {
          // Détecter les préférences système
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        } else {
          actualTheme = theme;
        }

        // Appliquer le thème au DOM
        if (actualTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }

        set({ theme, actualTheme });
      },

      toggleTheme: () => {
        const { actualTheme } = get();
        const newTheme = actualTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);