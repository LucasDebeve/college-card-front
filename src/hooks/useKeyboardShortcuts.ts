import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
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

      // ? : Help
      if (e.key === '?') {
        e.preventDefault();
        // TODO: Show help modal
        console.log('Show help modal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}