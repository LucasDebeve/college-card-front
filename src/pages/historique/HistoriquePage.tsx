import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { HistoriqueFilters } from '@/components/historique/HistoriqueFilters';
import { HistoriqueTable } from '@/components/historique/HistoriqueTable';
import { HistoriquePagination } from '@/components/historique/HistoriquePagination';
import { forgotCardService } from '@/services/forgotCardService';
import { toast } from 'sonner';
import type { ForgotCard } from '@/types';
import { format } from 'date-fns';

export function HistoriquePage() {
  const [forgotCards, setForgotCards] = useState<ForgotCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    loadForgotCards();
  }, [currentPage, pageSize, filters]);

  const loadForgotCards = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (filters.startDate) {
        params.start_date = format(filters.startDate, 'yyyy-MM-dd');
      }
      if (filters.endDate) {
        params.end_date = format(filters.endDate, 'yyyy-MM-dd');
      }
      if (filters.class && filters.class !== 'all') {
        params.class = filters.class;
      }
      if (filters.noteSent && filters.noteSent !== 'all') {
        params.note_manually_added = filters.note_manually_added === 'yes';
      }

      const data = await forgotCardService.getForgotCards(params);
      setForgotCards(data.results);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de charger l\'historique',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      toast.promise(
        forgotCardService.exportCSV(filters),
        {
          loading: 'Export en cours...',
          success: (blob) => {
            // Download file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oublis_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return 'CSV téléchargé avec succès';
          },
          error: 'Erreur lors de l\'export',
        }
      );
    } catch (error) {
      // Error handled by toast.promise
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            📜 Historique des oublis
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Consultation et export de tous les oublis enregistrés
          </p>
        </div>

        <Button className="gradient-green text-white" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <HistoriqueFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <HistoriqueTable
        forgotCards={forgotCards}
        isLoading={isLoading}
        onRowClick={(forgot) => {
          // TODO: Open detail modal
          console.log('Clicked:', forgot);
        }}
        onDelete={loadForgotCards}
      />

      {/* Pagination */}
      {!isLoading && forgotCards.length > 0 && (
        <HistoriquePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}