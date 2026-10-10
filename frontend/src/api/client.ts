import axios from 'axios';
import { Job, CandidateProfile, AdminOverview } from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);
      localStorage.setItem('user_email', response.data.email);
    }
    return response.data;
  },

  register: async (email: string, password: string, role = 'candidate') => {
    const response = await apiClient.post('/auth/register', { email, password, role });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
  },

  // Jobs Search & Details
  getJobs: async (params?: Record<string, any>) => {
    const response = await apiClient.get<{ items: Job[]; total: number; total_pages: number }>('/jobs', { params });
    return response.data;
  },

  getJobDetail: async (jobId: string) => {
    const response = await apiClient.get<Job>(`/jobs/${jobId}`);
    return response.data;
  },

  // Candidate Matching & Profile
  getProfile: async () => {
    const response = await apiClient.get<CandidateProfile>('/candidate/profile');
    return response.data;
  },

  updateProfile: async (profileData: Partial<CandidateProfile>) => {
    const response = await apiClient.post<CandidateProfile>('/candidate/profile', profileData);
    return response.data;
  },

  getMatches: async () => {
    const response = await apiClient.get<Job[]>('/candidate/matches');
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await apiClient.get<Job[]>('/candidate/saved-jobs');
    return response.data;
  },

  toggleSaveJob: async (jobId: string) => {
    const response = await apiClient.post(`/candidate/saved-jobs/${jobId}`);
    return response.data;
  },

  // Admin Analytics
  getAdminOverview: async () => {
    const response = await apiClient.get<AdminOverview>('/admin/overview');
    return response.data;
  },

  triggerScan: async () => {
    const response = await apiClient.post('/admin/scans/trigger');
    return response.data;
  }
};
