import axios from 'axios';
import { Note, Reminder, Transaction, HealthLog, Habit, CalendarEvent } from '../types';

// Use Vite environment variables (set in Cloudflare Pages dashboard)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with interceptor for auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hayatos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hayatos_token');
      localStorage.removeItem('hayatos_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== NOTES ====================
export const NotesService = {
  getAll: async () => (await api.get<Note[]>('/api/notes')).data,
  create: async (note: Partial<Note>) => (await api.post<Note>('/api/notes', note)).data,
  update: async (id: string, note: Partial<Note>) => (await api.put<Note>(`/api/notes/${id}`, note)).data,
  delete: async (id: string) => (await api.delete(`/api/notes/${id}`)).data,
};

// ==================== REMINDERS ====================
export const RemindersService = {
  getAll: async () => (await api.get<Reminder[]>('/api/reminders')).data,
  create: async (reminder: Partial<Reminder>) => (await api.post<Reminder>('/api/reminders', reminder)).data,
  toggleComplete: async (id: string) => (await api.patch<Reminder>(`/api/reminders/${id}/toggle`)).data,
  update: async (id: string, reminder: Partial<Reminder>) => (await api.put<Reminder>(`/api/reminders/${id}`, reminder)).data,
  delete: async (id: string) => (await api.delete(`/api/reminders/${id}`)).data,
};

// ==================== HABITS ====================
export const HabitsService = {
  getAll: async () => (await api.get<Habit[]>('/api/habits')).data,
  create: async (habit: Partial<Habit>) => (await api.post<Habit>('/api/habits', habit)).data,
  logStatus: async (id: string, date: string, status: string) =>
    (await api.post(`/api/habits/${id}/log`, { date, status })).data,
  update: async (id: string, habit: Partial<Habit>) => (await api.put<Habit>(`/api/habits/${id}`, habit)).data,
  delete: async (id: string) => (await api.delete(`/api/habits/${id}`)).data,
};

// ==================== HEALTH ====================
export const HealthService = {
  getLogs: async () => (await api.get<HealthLog[]>('/api/health')).data,
  logEntry: async (entry: Partial<HealthLog>) => (await api.post<HealthLog>('/api/health', entry)).data,
};

// ==================== FINANCE ====================
export const FinanceService = {
  getSummary: async () => (await api.get('/api/finance/summary')).data,
  getAccounts: async () => (await api.get('/api/accounts')).data,
  createAccount: async (account: any) => (await api.post('/api/accounts', account)).data,
  updateAccount: async (id: string, account: any) => (await api.put(`/api/accounts/${id}`, account)).data,
  getTransactions: async () => (await api.get<Transaction[]>('/api/transactions')).data,
  createTransaction: async (tx: Partial<Transaction>) => (await api.post<Transaction>('/api/transactions', tx)).data,
  updateTransaction: async (id: string, tx: Partial<Transaction>) => (await api.put<Transaction>(`/api/transactions/${id}`, tx)).data,
  getBudgets: async () => (await api.get('/api/budgets')).data,
  getGoals: async () => (await api.get('/api/finance/goals')).data,
};

// ==================== CALENDAR ====================
export const CalendarService = {
  getEvents: async () => (await api.get<CalendarEvent[]>('/api/events')).data,
  create: async (event: Partial<CalendarEvent>) => (await api.post<CalendarEvent>('/api/events', event)).data,
  update: async (id: string, event: Partial<CalendarEvent>) => (await api.put<CalendarEvent>(`/api/events/${id}`, event)).data,
  delete: async (id: string) => (await api.delete(`/api/events/${id}`)).data,
};

export const IslamicService = {
  getPrayerTimes: async (coords: { lat: number; lng: number }, date: Date) => {
    // Using Aladhan API
    const dateStr = date.toISOString().split('T')[0].split('-').reverse().join('-'); // DD-MM-YYYY
    const response = await axios.get(`https://api.aladhan.com/v1/timings/${dateStr}`, {
      params: {
        latitude: coords.lat,
        longitude: coords.lng,
        method: 2, // ISNA
        school: 0 // Shafi
      }
    });
    return response.data.data;
  },
  getLogs: async (dateStr: string) => (await api.get(`/api/islamic/logs?date=${dateStr}`)).data,
  logPrayer: async (data: { date: string; prayer: string; status: string }) => (await api.post('/api/islamic/logs', data)).data,
  getQibla: async (lat: number, lng: number) => {
    const response = await axios.get(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
    return response.data.data;
  }
};

// ==================== SETTINGS ====================
export const SettingsService = {
  getSettings: async () => (await api.get('/api/settings')).data,
  updateSettings: async (settings: any) => (await api.put('/api/settings', settings)).data,
};

// ==================== CONFIG ====================
export const ConfigService = {
  get: async () => (await api.get('/api/config')).data,
};

export default api;
