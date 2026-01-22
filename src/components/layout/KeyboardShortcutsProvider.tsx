import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore si on tape dans un input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl+H : Historique
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        navigate('/historique');
      }

      // Ctrl+S : Statistiques
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        navigate('/statistiques');
      }

      // Ctrl+D : Dashboard
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }

      // Ctrl+P : Profil
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        navigate('/profil');
      }

      // ? : Help (optionnel)
      if (e.key === '?') {
        e.preventDefault();
        console.log('Raccourcis clavier disponibles');
        // TODO: Afficher modal d'aide
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);

  return <>{children}</>;
}