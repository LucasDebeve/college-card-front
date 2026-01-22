// User types
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'surveillant' | 'admin';
  created_at: string;
  last_login: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// Student types
export interface Class {
  id: string;
  ecoledirecte_id: string;
  name: string;
  level: string;
  student_count: number;
  is_active: boolean;
}

export interface Student {
  id: string;
  ecoledirecte_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  student_class: string | null;
  class_name: string;
  class_details: Class | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentSearchResult {
  value: string;
  label: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

export interface StudentSearchResponse {
  count: number;
  results: StudentSearchResult[];
}

// ForgotCard types
export interface ForgotCard {
  id: string;
  student: string;
  student_details: Student;
  recorded_by: string;
  recorded_by_details: User;
  recorded_at: string;
  week_number: number;
  year: number;
  note_manually_added: boolean;
  note_manually_added_at: string | null;
  note_error: string;
  week_count?: number;
}

export interface ForgotCardCreate {
  student: string;
}

export interface ForgotCardResponse {
  id: string;
  student: string;
  student_details: Student;
  recorded_by: string;
  recorded_by_details: User;
  recorded_at: string;
  week_number: number;
  year: number;
  note_manually_added: boolean;
  week_count: number;
  is_third_forgot: boolean;
  message: string;
}

// Statistics types
export interface DashboardStats {
  today_count: number;
  week_count: number;
  notes_sent_week: number;
  pending_notes_count: number;
  students_to_watch: number;
}

export interface TopStudent {
  student_id: string;
  student_name: string;
  student_class: string;
  forgot_count: number;
  notes_sent: number;
}

export interface Statistics {
  period: string;
  total_forgot_cards: number;
  total_notes_sent: number;
  total_students_concerned: number;
  top_students: TopStudent[];
  by_class: { student__student_class__name: string; count: number }[];
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Student Requiring Note types
export interface StudentRequiringNote {
  student_id: string;
  student_name: string;
  student_class: string;
  ecoledirecte_id: string;
  forgot_count: number;
  last_forgot_at: string;
  note_manually_added: boolean;
  note_manually_added_at: string | null;
}

export interface StudentsRequiringNoteResponse {
  week_number: number;
  year: number;
  week_label: string;
  count: number;
  students: StudentRequiringNote[];
  message: string;
}

export interface MarkNoteRequest {
  student_id: string;
  week_number: number;
  year: number;
}

export interface MarkNoteResponse {
  success: boolean;
  student_id: string;
  student_name: string;
  week_number: number;
  year: number;
  forgot_cards_updated: number;
  message: string;
}