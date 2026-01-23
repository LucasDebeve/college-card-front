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
import { useMemo } from 'react';

interface RecentForgotsListProps {
  forgotCards: ForgotCard[];
  isLoading?: boolean;
}

export function RecentForgotsList({ forgotCards, isLoading }: RecentForgotsListProps) {
  const navigate = useNavigate();

  // Utiliser directement week_count fourni par l'API
  const enrichedForgotCards = useMemo(() => {
    return forgotCards
      .map((forgot) => ({
        ...forgot,
        position: forgot.week_count || 1,
      }))
      .slice(0, 5);
  }, [forgotCards]);

  if (isLoading) {
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