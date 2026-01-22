import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { forgotCardService } from '@/services/forgotCardService';
import type { StudentsRequiringNoteResponse, StudentRequiringNote } from '@/types';
import { cn } from '@/lib/utils';

interface StudentsRequiringNoteProps {
  onRefresh?: () => void;
}

// Fonction pour obtenir le numéro de semaine ISO et l'année
function getISOWeek(date: Date): { week: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week, year: target.getFullYear() };
}

// Fonction pour obtenir une date à partir d'une semaine ISO
function getDateFromISOWeek(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

export function StudentsRequiringNote({ onRefresh }: StudentsRequiringNoteProps) {
  const currentWeek = getISOWeek(new Date());
  const [selectedWeek, setSelectedWeek] = useState<{ week: number; year: number }>(currentWeek);
  const [data, setData] = useState<StudentsRequiringNoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markingStudentId, setMarkingStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadStudentsRequiringNote();
  }, [selectedWeek]);

  const loadStudentsRequiringNote = async () => {
    try {
      setIsLoading(true);
      const response = await forgotCardService.getStudentsRequiringNote({
        week_number: selectedWeek.week,
        year: selectedWeek.year,
      });
      setData(response);
    } catch (error) {
      console.error('Error loading students requiring note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsAdded = async (student: StudentRequiringNote) => {
    if (!data) return;

    try {
      setMarkingStudentId(student.student_id);
      await forgotCardService.markNoteAsManuallyAdded({
        student_id: student.student_id,
        week_number: data.week_number,
        year: data.year,
      });

      // Recharger les données
      await loadStudentsRequiringNote();
      onRefresh?.();
    } catch (error) {
      console.error('Error marking note as added:', error);
    } finally {
      setMarkingStudentId(null);
    }
  };

  const handleUnmarkAsAdded = async (student: StudentRequiringNote) => {
    if (!data) return;

    try {
      setMarkingStudentId(student.student_id);
      await forgotCardService.unmarkNoteAsManuallyAdded({
        student_id: student.student_id,
        week_number: data.week_number,
        year: data.year,
      });

      // Recharger les données
      await loadStudentsRequiringNote();
      onRefresh?.();
    } catch (error) {
      console.error('Error unmarking note as added:', error);
    } finally {
      setMarkingStudentId(null);
    }
  };

  const goToPreviousWeek = () => {
    const date = getDateFromISOWeek(selectedWeek.year, selectedWeek.week);
    date.setDate(date.getDate() - 7);
    setSelectedWeek(getISOWeek(date));
  };

  const goToNextWeek = () => {
    const date = getDateFromISOWeek(selectedWeek.year, selectedWeek.week);
    date.setDate(date.getDate() + 7);
    setSelectedWeek(getISOWeek(date));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(getISOWeek(new Date()));
  };

  const isCurrentWeek = selectedWeek.week === currentWeek.week && selectedWeek.year === currentWeek.year;

  if (isLoading) {
    return (
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            Élèves nécessitant un mot dans le carnet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[var(--text-secondary)]">
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.count === 0) {
    return (
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              Élèves nécessitant un mot dans le carnet
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {!isCurrentWeek && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToCurrentWeek}
                  className="gap-1"
                >
                  <CalendarDays className="w-4 h-4" />
                  Semaine actuelle
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="gap-1"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
          {data && (
            <p className="text-sm text-[var(--text-secondary)]">
              {data.week_label}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[var(--text-secondary)]">
            Aucun élève ne nécessite de mot cette semaine.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            Élèves nécessitant un mot dans le carnet
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {!isCurrentWeek && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentWeek}
                className="gap-1"
              >
                <CalendarDays className="w-4 h-4" />
                Semaine actuelle
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="gap-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-[var(--text-secondary)]">
          {data.week_label} - {data.count} élève{data.count > 1 ? 's' : ''} avec 3 oublis ou plus
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.students.map((student) => (
            <div
              key={student.student_id}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-all',
                student.note_manually_added
                  ? 'bg-green-primary/20 border-green-primary'
                  : 'bg-violet-primary/20 border-violet-primary'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[var(--text-primary)]">
                    {student.student_name}
                  </h4>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {student.student_class}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                  <span>
                    {student.forgot_count} oubli{student.forgot_count > 1 ? 's' : ''}
                  </span>
                  {student.note_manually_added && student.note_manually_added_at && (
                    <span className="text-green-primary font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Mot rentré le {new Date(student.note_manually_added_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
              <div>
                {student.note_manually_added ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnmarkAsAdded(student)}
                    disabled={markingStudentId === student.student_id}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleMarkAsAdded(student)}
                    disabled={markingStudentId === student.student_id}
                    className="gap-2 bg-violet-primary hover:bg-violet-dark"
                  >
                    <Check className="w-4 h-4" />
                    Marquer comme rentré
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
