import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Avatar } from '@/components/shared/Avatar';
import { studentService } from '@/services/studentService';
import type { StudentSearchResult } from '@/types';
import { cn } from '@/lib/utils';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { actualTheme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/dashboard', label: '🏠 Accueil' },
    { path: '/statistiques', label: '📊 Statistiques' },
    { path: '/historique', label: '📜 Historique' },
  ];

  // Debounce search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await studentService.searchStudents(searchQuery);
        setSearchResults(results);
        setIsSearchOpen(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('header-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectStudent = (studentId: string) => {
    navigate(`/dashboard?student=${studentId}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-4xl">🏫</div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-primary to-green-primary bg-clip-text text-transparent">
            CollègeCard
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-2 ml-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                location.pathname === item.path
                  ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-primary'
                  : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="header-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève (Ctrl+K)"
              className="pl-12 h-12 text-base border-2 focus:border-violet-primary"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] rounded-xl shadow-2xl border-2 border-[var(--border)] max-h-96 overflow-y-auto">
              {searchResults.map((student) => (
                <button
                  key={student.value}
                  onClick={() => handleSelectStudent(student.value)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-b border-[var(--border)] last:border-b-0"
                >
                  <Avatar
                    firstName={student.first_name}
                    lastName={student.last_name}
                    size="sm"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-[var(--text-primary)]">
                      {student.last_name.toUpperCase()} {student.first_name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {student.class_name || 'Sans classe'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {actualTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          >
            <Bell className="w-5 h-5" />
            {pendingNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {pendingNotifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                {user && (
                  <>
                    <Avatar
                      firstName={user.first_name}
                      lastName={user.last_name}
                      size="sm"
                    />
                    <span className="font-medium text-sm hidden md:inline">
                      {user.first_name} {user.last_name.charAt(0)}.
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role === 'admin' ? 'Administrateur' : 'Surveillant'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Mon profil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}