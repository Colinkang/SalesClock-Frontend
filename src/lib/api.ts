import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (email: string, password: string, name: string, invitationToken?: string) => {
    const { data } = await api.post('/auth/register', {
      email,
      password,
      name,
      invitationToken,
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Customers API
export const customersApi = {
  getAll: async () => {
    const { data } = await api.get('/customers');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (customer: any) => {
    const { data } = await api.post('/customers', customer);
    return data;
  },

  update: async (id: string, customer: any) => {
    const { data } = await api.put(`/customers/${id}`, customer);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },
};

// Visit Plans API
export const visitPlansApi = {
  getAll: async (filters?: { date?: string; month?: string }) => {
    const { data } = await api.get('/visit-plans', { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/visit-plans/${id}`);
    return data;
  },

  create: async (plan: any) => {
    const { data } = await api.post('/visit-plans', plan);
    return data;
  },

  update: async (id: string, plan: any) => {
    const { data } = await api.put(`/visit-plans/${id}`, plan);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/visit-plans/${id}`);
    return data;
  },

  checkIn: async (id: string, checkInData: any) => {
    const { data } = await api.post(`/visit-plans/${id}/check-in`, checkInData);
    return data;
  },
};

// Visit Reports API
export const visitReportsApi = {
  getAll: async () => {
    const { data } = await api.get('/visit-reports');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/visit-reports/${id}`);
    return data;
  },

  create: async (report: any) => {
    const { data } = await api.post('/visit-reports', report);
    return data;
  },

  update: async (id: string, report: any) => {
    const { data } = await api.put(`/visit-reports/${id}`, report);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/visit-reports/${id}`);
    return data;
  },
};

// Articles API
export const articlesApi = {
  getAll: async () => {
    const { data } = await api.get('/articles');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/articles/${id}`);
    return data;
  },

  create: async (article: any) => {
    const { data } = await api.post('/articles', article);
    return data;
  },

  update: async (id: string, article: any) => {
    const { data } = await api.put(`/articles/${id}`, article);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/articles/${id}`);
    return data;
  },
};

// Invitations API
export const invitationsApi = {
  getAll: async () => {
    const { data } = await api.get('/invitations');
    return data;
  },

  verify: async (token: string) => {
    const { data } = await api.get(`/invitations/verify/${token}`);
    return data;
  },

  create: async (invitation: any) => {
    const { data } = await api.post('/invitations', invitation);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/invitations/${id}`);
    return data;
  },
};

export default api;

