import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/shared/Avatar';
import { CounterBadge } from '@/components/shared/CounterBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { forgotCardService } from '@/services/forgotCardService';
import { toast } from 'sonner';
import { format, startOfISOWeek, endOfISOWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { StudentSearchResult, ForgotCard } from '@/types';
import { cn } from '@/lib/utils';

interface ForgotCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentSearchResult | null;
  onSuccess?: (forgotCard: any) => void;
}

export function ForgotCardModal({ 
  open, 
  onOpenChange, 
  student,
  onSuccess 
}: ForgotCardModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [weekCount, setWeekCount] = useState(0);
  const [recentForgots, setRecentForgots] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (open && student) {
      loadStudentData();
    }
  }, [open, student]);

  const loadStudentData = async () => {
    if (!student) return;

    setIsLoadingData(true);
    try {
      // Récupérer le compteur de la semaine
      const weekData = await forgotCardService.getWeekCount(student.value);
      setWeekCount(weekData.week_count);

      // Récupérer les derniers oublis
      const forgotCards = await forgotCardService.getForgotCards({
        student_id: student.value,
        page_size: 5,
      });

      const dates = forgotCards.results.map((f) =>
        format(new Date(f.recorded_at), 'EEEE dd/MM à HH:mm', { locale: fr })
      );
      setRecentForgots(dates);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleConfirm = async () => {
    if (!student) return;

    setIsLoading(true);
    try {
      const result = await forgotCardService.createForgotCard({
        student: student.value,
      });

      if (result.is_third_forgot) {
        toast.success('Oubli enregistré !', {
          description: `📧 Mot à envoyer à ${student.label}`,
          duration: 5000,
        });
      } else {
        toast.success('Oubli enregistré !', {
          description: `Compteur : ${result.week_count}/3 pour ${student.label}`,
          duration: 5000,
        });
      }

      onSuccess?.(result);
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.response?.data?.detail || 'Impossible d\'enregistrer l\'oubli',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) return null;

  const isThirdForgot = weekCount === 2;
  const now = new Date();
  const weekStart = startOfISOWeek(now);
  const weekEnd = endOfISOWeek(now);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className={isThirdForgot ? "text-red-600" : ""}>
            {isThirdForgot ? (
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ALERTE - 3ème oubli !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Confirmer l'enregistrement
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Enregistrement d'un oubli de carte pour cet élève
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-violet-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-lg">
              <Avatar
                firstName={student.first_name}
                lastName={student.last_name}
                size="md"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {student.last_name.toUpperCase()} {student.first_name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Classe : {student.class_name || 'Sans classe'}
                </p>
              </div>
            </div>

            {/* Week Counter */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              isThirdForgot 
                ? "bg-[var(--violet-very-light)]/20 border-[var(--violet-very-light)]"
                : weekCount >= 1
                ? "bg-[var(--orange-very-light)]/20 border-[var(--orange-very-light)]"
                : "bg-[var(--green-very-light)]/20 border-[var(--green-very-light)]"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Oublis cette semaine :
                </span>
                <CounterBadge current={weekCount} showDots />
              </div>
            </div>

            {/* Recent History */}
            {recentForgots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  📜 Historique récent :
                </h4>
                <ul className="space-y-1 text-sm">
                  {recentForgots.map((date, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-primary" />
                      <span className="capitalize">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recentForgots.length === 0 && (
              <p className="text-sm text-[var(--text-secondary)] italic">
                Aucun oubli précédent cette année
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isLoadingData}
            className={isThirdForgot ? "gradient-red" : "gradient-violet"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : isThirdForgot ? (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Confirmer l'oubli
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmer l'oubli
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}