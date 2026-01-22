import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentForgotsList } from '@/components/dashboard/RecentForgotsList';
import { StudentsRequiringNote } from '@/components/dashboard/StudentsRequiringNote';
import { SearchBar } from '@/components/shared/SearchBar';
import { ForgotCardModal } from '@/components/dashboard/ForgotCardModal';
import { forgotCardService } from '@/services/forgotCardService';
import type { StudentSearchResult, DashboardStats, ForgotCard } from '@/types';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentForgots, setRecentForgots] = useState<ForgotCard[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingForgots, setIsLoadingForgots] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const studentId = searchParams.get('student');
    if (studentId) {
      // TODO: Ouvrir le modal avec l'élève
    }
  }, [searchParams]);

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques
      setIsLoadingStats(true);
      const statsData = await forgotCardService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }

    try {
      // Charger les derniers oublis
      setIsLoadingForgots(true);
      const forgotsData = await forgotCardService.getForgotCards({
        page_size: 5,
        period: 'today',
      });
      setRecentForgots(forgotsData.results);
    } catch (error) {
      console.error('Error loading forgots:', error);
    } finally {
      setIsLoadingForgots(false);
    }
  };

  const handleSelectStudent = (studentId: string, studentData: StudentSearchResult) => {
    setSelectedStudent(studentData);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Recharger les données
    loadDashboardData();
  };

  return (
    <div className="space-y-8">
      {/* Hero Section - Search */}
      <div className="bg-gradient-to-br from-violet-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 text-center">
        <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
          🔍 Rechercher un élève pour enregistrer un oubli
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Tapez le nom, prénom ou classe de l'élève
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar onSelectStudent={handleSelectStudent} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Aujourd'hui"
          value={stats?.today_count || 0}
          icon={Calendar}
          subtitle="oublis enregistrés"
          variant="default"
          trend={stats ? { value: 3, isPositive: false } : undefined}
        />
        <StatCard
          title="Cette semaine"
          value={stats?.week_count || 0}
          icon={TrendingUp}
          subtitle="oublis cette semaine"
          variant="success"
        />
        <StatCard
          title="Élèves à surveiller"
          value={stats?.students_to_watch || 0}
          icon={AlertTriangle}
          subtitle="élèves à 2/3 oublis"
          variant="warning"
        />
      </div>

      {/* Recent Forgots List */}
      <RecentForgotsList
        forgotCards={recentForgots}
        isLoading={isLoadingForgots}
      />

      {/* Students Requiring Note */}
      <StudentsRequiringNote onRefresh={loadDashboardData} />

      {/* Modal */}
      <ForgotCardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        student={selectedStudent}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}