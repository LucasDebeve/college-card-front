import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CounterBadge } from '@/components/shared/CounterBadge';
import { Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ForgotCard } from '@/types';
import { useEffect, useState, useCallback } from 'react';
import { forgotCardService } from '@/services/forgotCardService';

interface HistoriqueTableProps {
  forgotCards: ForgotCard[];
  isLoading?: boolean;
  onRowClick?: (forgot: ForgotCard) => void;
}

interface ForgotCardWithPosition extends ForgotCard {
  position: number;
}

export function HistoriqueTable({
  forgotCards,
  isLoading,
  onRowClick
}: HistoriqueTableProps) {
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

      setEnrichedForgotCards(enriched);
    } catch (error) {
      console.error('Error enriching forgots with positions:', error);
      // En cas d'erreur, utiliser week_count comme fallback
      const fallback = forgotCards.map((forgot) => ({
        ...forgot,
        position: forgot.week_count || 1,
      }));
      setEnrichedForgotCards(fallback);
    } finally {
      setIsEnriching(false);
    }
  }, [forgotCards]);

  useEffect(() => {
    enrichForgotsWithPositions();
  }, [enrichForgotsWithPositions]);
  if (isLoading || isEnriching) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 animate-shimmer rounded-lg" />
        ))}
      </div>
    );
  }

  if (enrichedForgotCards.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold text-[var(--text-primary)]">
          Aucun résultat
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Essayez de modifier vos filtres
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <TableHead className="font-bold text-[var(--text-primary)]">Date/Heure</TableHead>
            <TableHead className="font-bold text-[var(--text-primary)]">Élève</TableHead>
            <TableHead className="font-bold text-center text-[var(--text-primary)]">Classe</TableHead>
            <TableHead className="font-bold text-[var(--text-primary)]">Surveillant</TableHead>
            <TableHead className="font-bold text-center text-[var(--text-primary)]">Compteur</TableHead>
            <TableHead className="font-bold text-center text-[var(--text-primary)]">Mot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrichedForgotCards.map((forgot) => {
            const position = forgot.position;

            return (
              <TableRow
                key={forgot.id}
                className="cursor-pointer"
                style={{
                  backgroundColor: forgot.note_manually_added ? 'var(--table-row-warning)' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!forgot.note_manually_added) {
                    e.currentTarget.style.backgroundColor = 'var(--table-row-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!forgot.note_manually_added) {
                    e.currentTarget.style.backgroundColor = '';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--table-row-warning)';
                  }
                }}
                onClick={() => onRowClick?.(forgot)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(new Date(forgot.recorded_at), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {format(new Date(forgot.recorded_at), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {forgot.student_details.last_name.toUpperCase()}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {forgot.student_details.first_name}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[var(--text-secondary)]">
                    {forgot.student_details.class_name || 'N/A'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    {forgot.recorded_by_details.first_name}{' '}
                    {forgot.recorded_by_details.last_name.charAt(0)}.
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <CounterBadge current={position} total={3} size="sm" />
                </TableCell>

                <TableCell className="text-center">
                  {forgot.note_manually_added ? (
                    <Badge variant="destructive" className="gap-1">
                      <Mail className="w-3 h-3" />
                      Envoyé
                    </Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}