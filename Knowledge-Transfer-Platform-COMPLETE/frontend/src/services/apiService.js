import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username, password) {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  // Knowledge endpoints
  async getArtifacts(params = {}) {
    const response = await this.api.get('/artifacts', { params });
    return response.data;
  }

  async getArtifact(id) {
    const response = await this.api.get(`/artifacts/${id}`);
    return response.data;
  }

  // Search endpoints
  async search(query, params = {}) {
    const response = await this.api.get('/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  }

  // Chat endpoints
  async askAI(question) {
    const response = await this.api.post('/chat/ask', { question });
    return response.data;
  }
}

export const apiService = new ApiService();
