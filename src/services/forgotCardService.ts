import api from '@/lib/api';
import type {
  ForgotCard,
  ForgotCardCreate,
  ForgotCardResponse,
  PaginatedResponse,
  DashboardStats,
  Statistics,
  StudentsRequiringNoteResponse,
  MarkNoteRequest,
  MarkNoteResponse,
} from '@/types';

export const forgotCardService = {
  // Créer un oubli
  async createForgotCard(data: ForgotCardCreate): Promise<ForgotCardResponse> {
    const response = await api.post<ForgotCardResponse>('/forgot-cards/create/', data);
    return response.data;
  },

  // Liste des oublis
  async getForgotCards(params?: {
    student_id?: string;
    class?: string;
    period?: 'today' | 'week' | 'month';
    start_date?: string;
    end_date?: string;
    note_manually_added?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ForgotCard>> {
    const response = await api.get<PaginatedResponse<ForgotCard>>('/forgot-cards/', { params });
    return response.data;
  },

  // Détails d'un oubli
  async getForgotCard(id: string): Promise<ForgotCard> {
    const response = await api.get<ForgotCard>(`/forgot-cards/${id}/`);
    return response.data;
  },

  // Compteur semaine pour un élève
  async getWeekCount(studentId: string): Promise<{
    student_id: string;
    student_name: string;
    week_count: number;
    should_send_note: boolean;
  }> {
    const response = await api.get(`/forgot-cards/week/${studentId}/`);
    return response.data;
  },

  // Statistiques dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/forgot-cards/stats/dashboard/');
    return response.data;
  },

  // Statistiques générales
  async getStatistics(period: 'week' | 'month' | 'year' = 'week'): Promise<Statistics> {
    const response = await api.get<Statistics>('/forgot-cards/stats/', {
      params: { period },
    });
    return response.data;
  },

  // Export CSV
  async exportCSV(params?: {
    start_date?: string;
    end_date?: string;
    class?: string;
  }): Promise<Blob> {
    const response = await api.get('/forgot-cards/export/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Liste des élèves nécessitant un mot dans le carnet
  async getStudentsRequiringNote(params?: {
    week_number?: number;
    year?: number;
  }): Promise<StudentsRequiringNoteResponse> {
    const response = await api.get<StudentsRequiringNoteResponse>(
      '/forgot-cards/students/requiring-note/',
      { params }
    );
    return response.data;
  },

  // Marquer un mot comme ajouté manuellement dans EcoleDirecte
  async markNoteAsManuallyAdded(data: MarkNoteRequest): Promise<MarkNoteResponse> {
    const response = await api.post<MarkNoteResponse>(
      '/forgot-cards/notes/mark-manually-added/',
      data
    );
    return response.data;
  },

  // Annuler le marquage d'un mot comme ajouté manuellement
  async unmarkNoteAsManuallyAdded(data: MarkNoteRequest): Promise<MarkNoteResponse> {
    const response = await api.post<MarkNoteResponse>(
      '/forgot-cards/notes/unmark-manually-added/',
      data
    );
    return response.data;
  },
};