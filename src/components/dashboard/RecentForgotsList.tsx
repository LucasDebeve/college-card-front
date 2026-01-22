import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, ArrowRight, Mail } from 'lucide-react';
import { CounterBadge } from '@/components/shared/CounterBadge';
import type { ForgotCard } from '@/types';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import { forgotCardService } from '@/services/forgotCardService';

interface RecentForgotsListProps {
  forgotCards: ForgotCard[];
  isLoading?: boolean;
}

interface ForgotCardWithPosition extends ForgotCard {
  position: number;
}

export function RecentForgotsList({ forgotCards, isLoading }: RecentForgotsListProps) {
  const navigate = useNavigate();
  const [enrichedForgotCards, setEnrichedForgotCards] = useState<ForgotCardWithPosition[]>([]);
  const [isEnriching, setIsEnriching] = useState(true);

  const enrichForgotsWithPositions = useCallback(async () => {
    if (forgotCards.length === 0) {
      setEnrichedForgotCards([]);
      setIsEnriching(false);
      return;
    }

    try {
      setIsEnriching(true);

      // Grouper les oublis par élève et semaine
      const studentWeekMap = new Map<string, ForgotCard[]>();

      for (const forgot of forgotCards) {
        const key = `${forgot.student}-${forgot.week_number}-${forgot.year}`;
        if (!studentWeekMap.has(key)) {
          studentWeekMap.set(key, []);
        }
        studentWeekMap.get(key)!.push(forgot);
      }

      // Pour chaque groupe, charger tous les oublis de la semaine
      const positionMap = new Map<string, number>();

      for (const groupForgots of studentWeekMap.values()) {
        const firstForgot = groupForgots[0];

        // Charger tous les oublis de cette semaine pour cet élève
        const allWeekForgots = await forgotCardService.getForgotCards({
          student_id: firstForgot.student,
          page_size: 100,
        });

        // Filtrer pour ne garder que les oublis de cette semaine
        const weekForgots = allWeekForgots.results.filter(
          (f) => f.week_number === firstForgot.week_number && f.year === firstForgot.year
        );

        // Trier par date
        weekForgots.sort((a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        );

        // Assigner une position à chaque oubli
        weekForgots.forEach((forgot, index) => {
          positionMap.set(forgot.id, index + 1);
        });
      }

      // Enrichir les oublis avec leur position
      const enriched = forgotCards.map((forgot) => ({
        ...forgot,
        position: positionMap.get(forgot.id) || 1,
      }));

      setEnrichedForgotCards(enriched.slice(0, 5));
    } catch (error) {
      console.error('Error enriching forgots with positions:', error);
      // En cas d'erreur, utiliser week_count comme fallback
      const fallback = forgotCards.map((forgot) => ({
        ...forgot,
        position: forgot.week_count || 1,
      }));
      setEnrichedForgotCards(fallback.slice(0, 5));
    } finally {
      setIsEnriching(false);
    }
  }, [forgotCards]);

  useEffect(() => {
    enrichForgotsWithPositions();
  }, [enrichForgotsWithPositions]);

  if (isLoading || isEnriching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📜 Derniers oublis enregistrés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-shimmer rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:border-gray-700">
      <CardHeader>
        <CardTitle>📜 Derniers oublis enregistrés</CardTitle>
        <CardDescription>
          Les 5 derniers oublis de carte enregistrés
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enrichedForgotCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              Aucun oubli aujourd'hui !
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              C'est une excellente journée 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {enrichedForgotCards.map((forgot) => {
              const position = forgot.position;

              return (
                <div
                  key={forgot.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border border-[var(--border)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer",
                    forgot.note_manually_added && "bg-[var(--danger-red-50)]/20 border-[var(--danger-red-200)] hover:bg-[var(--danger-red-50)]/30"
                  )}
                  onClick={() => navigate(`/historique?forgot=${forgot.id}`)}
                >
                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] w-24">
                    <Clock className="w-4 h-4" />
                    {format(new Date(forgot.recorded_at), 'HH:mm', { locale: fr })}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--text-primary)]">
                      {forgot.student_details.last_name.toUpperCase()}{' '}
                      {forgot.student_details.first_name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {forgot.student_details.class_name || 'Sans classe'}
                    </div>
                  </div>

                  {/* Counter */}
                  <CounterBadge current={position} total={3} />

                  {/* Status */}
                  {forgot.note_manually_added && (
                    <Badge variant="destructive" className="gap-1">
                      <Mail className="w-3 h-3" />
                      Mot envoyé
                    </Badge>
                  )}
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/historique')}
            >
              Voir tout l'historique
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}