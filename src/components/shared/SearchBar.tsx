import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { studentService } from '@/services/studentService';
import { Avatar } from './Avatar';
import { CounterBadge } from './CounterBadge';
import { forgotCardService } from '@/services/forgotCardService';
import type { StudentSearchResult } from '@/types';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSelectStudent: (studentId: string, studentData: StudentSearchResult) => void;
}

export function SearchBar({ onSelectStudent }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [weekCounts, setWeekCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await studentService.searchStudents(query);
        setResults(data);
        setIsOpen(data.length > 0);

        // Fetch week counts for each student
        const counts: Record<string, number> = {};
        await Promise.all(
          data.map(async (student) => {
            try {
              const weekData = await forgotCardService.getWeekCount(student.value);
              counts[student.value] = weekData.week_count;
            } catch {
              counts[student.value] = 0;
            }
          })
        );
        setWeekCounts(counts);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (student: StudentSearchResult) => {
    onSelectStudent(student.value, student);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un élève (Nom, Prénom, Classe)..."
          className="pl-12 h-14 text-lg border-2 focus:border-violet-primary"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] rounded-xl shadow-2xl border-2 border-gray-20 max-h-96 overflow-y-auto z-50">
          {results.map((student, index) => (
            <button
              key={student.value}
              onClick={() => handleSelect(student)}
              className={cn(
                'w-full flex items-center gap-4 p-4 hover:bg-[var(--violet-very-light)]/50 transition-colors border-b border-gray-100 last:border-b-0',
                selectedIndex === index && 'bg-[var(--violet-very-light)]'
              )}
            >
              <Avatar
                firstName={student.first_name}
                lastName={student.last_name}
                size="sm"
              />
              <div className="flex-1 text-left">
                <div className="font-semibold text-[var(--card-foreground)]">
                  {student.last_name.toUpperCase()} {student.first_name}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {student.class_name || 'Sans classe'}
                </div>
              </div>
              <CounterBadge current={weekCounts[student.value] || 0} size="sm" />
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500">
          Recherche en cours...
        </div>
      )}
    </div>
  );
}