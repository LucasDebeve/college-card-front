import api from '@/lib/api';
import type { 
  Student, 
  StudentSearchResult, 
  PaginatedResponse, 
  StudentSearchResponse
} from '@/types';

export const studentService = {
  // Liste des élèves
  async getStudents(params?: {
    student_class?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Student>> {
    const response = await api.get<PaginatedResponse<Student>>('/students/', { params });
    return response.data;
  },

  // Recherche élèves (autocomplétion)
  async searchStudents(query: string): Promise<StudentSearchResult[]> {
    const response = await api.get<StudentSearchResponse>('/students/search/', {
      params: { q: query },
    });
    return response.data.results;
  },

  // Détails d'un élève
  async getStudent(id: string): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}/`);
    return response.data;
  },

  // Synchroniser depuis EcoleDirecte
  async syncStudents(): Promise<{
    message: string;
    students_added: number;
    students_updated: number;
    students_deactivated: number;
  }> {
    const response = await api.post('/students/sync/');
    return response.data;
  },
};