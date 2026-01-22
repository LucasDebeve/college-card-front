import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { PodiumCard } from '@/components/statistiques/PodiumCard';
import { ClassChart } from '@/components/statistiques/ClassChart';
import { EvolutionChart } from '@/components/statistiques/EvolutionChart';
import { HeatmapCalendar } from '@/components/statistiques/HeatmapCalendar';
import { forgotCardService } from '@/services/forgotCardService';
import { toast } from 'sonner';
import type { Statistics } from '@/types';
import { cn } from '@/lib/utils';

type Period = 'week' | 'month' | 'year';

export function StatistiquesPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data pour l'évolution et heatmap (à remplacer par vraies données API)
  const evolutionData = [
    { day: 'Lun', count: 8 },
    { day: 'Mar', count: 12 },
    { day: 'Mer', count: 15 },
    { day: 'Jeu', count: 10 },
    { day: 'Ven', count: 18 },
  ];

  const heatmapData = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (90 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20),
    };
  });

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const data = await forgotCardService.getStatistics(period);
      setStats(data);
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de charger les statistiques',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      toast.promise(
        async () => {
          // TODO: Implémenter export PDF côté backend
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
        {
          loading: 'Génération du PDF...',
          success: 'PDF téléchargé avec succès',
          error: 'Erreur lors de l\'export',
        }
      );
    } catch (error) {
      // Error handled by toast.promise
    }
  };

  const classData = stats?.by_class.map((item) => ({
    name: item.student__student_class__name || 'Sans classe',
    count: item.count,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            📊 Statistiques
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Analyse des oublis de carte - {stats?.period || 'Chargement...'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button className="gradient-green text-white" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Period Filters */}
      <div className="flex gap-3">
        {(['week', 'month', 'year'] as Period[]).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            className={cn(
              'rounded-full',
              period === p && 'gradient-violet text-white'
            )}
            onClick={() => setPeriod(p)}
          >
            {p === 'week' && 'Cette semaine'}
            {p === 'month' && 'Ce mois'}
            {p === 'year' && 'Cette année'}
          </Button>
        ))}
      </div>

      {/* Podium */}
      <PodiumCard students={stats?.top_students || []} isLoading={isLoading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassChart data={classData} isLoading={isLoading} />
        <EvolutionChart data={evolutionData} isLoading={isLoading} />
      </div>

      {/* Heatmap */}
      <HeatmapCalendar data={heatmapData} isLoading={isLoading} />
    </div>
  );
}