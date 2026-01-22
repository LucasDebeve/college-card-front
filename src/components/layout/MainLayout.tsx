import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { KeyboardShortcutsProvider } from './KeyboardShortcutsProvider';

export function MainLayout() {
  return (
    <KeyboardShortcutsProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </KeyboardShortcutsProvider>
  );
}