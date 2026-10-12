import axios from 'axios';
import { 
  Job, CandidateProfile, AdminOverview, MarketInsights, AdminNotificationsResponse, 
  AdminNotificationItem, ScanRunItem, AdminUsersResponse, DayWiseJobsResponse 
} from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isUserAuthenticated = (): boolean => {
  const token = sessionStorage.getItem('access_token');
  return Boolean(token);
};

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.access_token) {
      sessionStorage.setItem('access_token', response.data.access_token);
      sessionStorage.setItem('user_role', response.data.role);
      sessionStorage.setItem('user_email', response.data.email);
      if (response.data.experience_tier) {
        sessionStorage.setItem('user_experience_tier', response.data.experience_tier);
        localStorage.setItem('user_experience_tier', response.data.experience_tier);
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
    }
    return response.data;
  },

  register: async (email: string, password: string, role = 'candidate', experience_tier = 'fresher', years_experience = 0) => {
    const response = await apiClient.post('/auth/register', { email, password, role, experience_tier, years_experience });
    return response.data;
  },

  sendOTP: async (email: string, purpose: 'register' | 'login' = 'register') => {
    const response = await apiClient.post<{
      status: string;
      message: string;
      email: string;
      expires_in_seconds: number;
      dev_otp?: string;
    }>('/auth/send-otp', { email, purpose });
    return response.data;
  },

  verifyRegister: async (data: {
    email: string;
    otp: string;
    password: string;
    full_name?: string;
    role?: string;
    experience_tier?: string;
    years_experience?: number;
  }) => {
    const response = await apiClient.post('/auth/verify-register', data);
    if (response.data.access_token) {
      sessionStorage.setItem('access_token', response.data.access_token);
      sessionStorage.setItem('user_role', response.data.role);
      sessionStorage.setItem('user_email', response.data.email);
      if (response.data.experience_tier) {
        sessionStorage.setItem('user_experience_tier', response.data.experience_tier);
        localStorage.setItem('user_experience_tier', response.data.experience_tier);
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
    }
    return response.data;
  },

  verifyOTPLogin: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp-login', { email, otp });
    if (response.data.access_token) {
      sessionStorage.setItem('access_token', response.data.access_token);
      sessionStorage.setItem('user_role', response.data.role);
      sessionStorage.setItem('user_email', response.data.email);
      if (response.data.experience_tier) {
        sessionStorage.setItem('user_experience_tier', response.data.experience_tier);
        localStorage.setItem('user_experience_tier', response.data.experience_tier);
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_email');
    }
    return response.data;
  },


  quickLoginAsCandidate: async () => {
    return api.login('nithin@example.com', 'NithinPass123!');
  },

  quickLoginAsAdmin: async () => {
    return await api.login('nithinvandana560@gmail.com', '9347388372pandu@');
  },

  logout: () => {
    sessionStorage.clear();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_experience_tier');
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

  getMarketInsights: async () => {
    const response = await apiClient.get<MarketInsights>('/jobs/insights');
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

  // Admin Analytics & Intelligence
  getAdminOverview: async () => {
    const response = await apiClient.get<AdminOverview>('/admin/overview');
    return response.data;
  },

  getAdminNotifications: async () => {
    const response = await apiClient.get<AdminNotificationsResponse>('/admin/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.post<{ status: string; id: string }>(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.post<{ status: string }>('/admin/notifications/mark-all-read');
    return response.data;
  },

  getScanRuns: async () => {
    const response = await apiClient.get<ScanRunItem[]>('/admin/scans');
    return response.data;
  },

  triggerScan: async () => {
    const response = await apiClient.post<{
      status: string;
      message: string;
      run_id: string;
      jobs_found: number;
      new_jobs: number;
      updated_jobs: number;
      companies_scanned: number;
    }>('/admin/scans/trigger');
    return response.data;
  },

  getAdminUsers: async () => {
    const response = await apiClient.get<AdminUsersResponse>('/admin/users');
    return response.data;
  },

  toggleUserStatus: async (userId: string) => {
    const response = await apiClient.post<{ status: string; user_id: string; account_status: string }>(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  getDayWiseJobs: async () => {
    const response = await apiClient.get<DayWiseJobsResponse>('/admin/jobs/day-wise-breakdown');
    return response.data;
  }
};
