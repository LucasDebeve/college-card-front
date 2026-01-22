import api from '@/lib/api';
import type { 
  LoginCredentials, 
  AuthResponse, 
  User 
} from '@/types';

export const authService = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  // Déconnexion
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout/', { refresh_token: refreshToken });
  },

  // Récupérer le profil
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    await api.post('/auth/change-password/', data);
  },
};