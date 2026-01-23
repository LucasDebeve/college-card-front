import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏫</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-primary to-green-primary bg-clip-text text-transparent">
            CollègeCard
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gestion des oublis de carte
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}