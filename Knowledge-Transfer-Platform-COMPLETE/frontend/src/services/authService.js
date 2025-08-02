import { apiService } from './apiService';

class AuthService {
  async login(username, password) {
    try {
      const response = await apiService.login(username, password);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async getCurrentUser() {
    try {
      const response = await apiService.getCurrentUser();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get user data');
    }
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}

export const authService = new AuthService();
