import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';
import { router } from '@/router';

function App() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme
  useEffect(() => {
    setTheme(theme);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </>
  );
}

export default App;