import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CounterBadge } from '@/components/shared/CounterBadge';
import { Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ForgotCard } from '@/types';
import { useState, useMemo } from 'react';
import { forgotCardService } from '@/services/forgotCardService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface HistoriqueTableProps {
  forgotCards: ForgotCard[];
  isLoading?: boolean;
  onRowClick?: (forgot: ForgotCard) => void;
  onDelete?: () => void;
}

interface ForgotCardWithPosition extends ForgotCard {
  position: number;
}

export function HistoriqueTable({
  forgotCards,
  isLoading,
  onRowClick,
  onDelete
}: HistoriqueTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forgotToDelete, setForgotToDelete] = useState<ForgotCardWithPosition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Utiliser directement week_count fourni par l'API
  const enrichedForgotCards = useMemo(() => {
    return forgotCards.map((forgot) => ({
      ...forgot,
      position: forgot.week_count || 1,
    }));
  }, [forgotCards]);

  const handleDeleteClick = (forgot: ForgotCardWithPosition, e: React.MouseEvent) => {
    e.stopPropagation();
    setForgotToDelete(forgot);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!forgotToDelete) return;

    setIsDeleting(true);
    try {
      await forgotCardService.deleteForgotCard(forgotToDelete.id);
      toast.success('Oubli supprimé', {
        description: `L'oubli de ${forgotToDelete.student_details.full_name} a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setForgotToDelete(null);
      onDelete?.();
    } catch {
      toast.error('Erreur', {
        description: 'Impossible de supprimer cet oubli.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
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
    <>
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
              <TableHead className="font-bold text-center text-[var(--text-primary)]">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {enrichedForgotCards.map((forgot) => {
            const position = forgot.position;

            return (
              <TableRow
                key={forgot.id}
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

                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-[var(--danger-red-200)]/20 hover:text-red-500 cursor-pointer"
                    onClick={(e) => handleDeleteClick(forgot, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            {forgotToDelete && (
              <>
                Êtes-vous sûr de vouloir supprimer l'oubli de{' '}
                <strong>{forgotToDelete.student_details.full_name}</strong> enregistré le{' '}
                <strong>
                  {format(new Date(forgotToDelete.recorded_at), 'dd/MM/yyyy à HH:mm', {
                    locale: fr,
                  })}
                </strong>
                ?
                <br />
                <br />
                Cette action est irréversible.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}