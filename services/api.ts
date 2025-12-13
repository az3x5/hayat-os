import axios from 'axios';
import { Note, Reminder, Transaction, HealthLog } from '../types';

const API_URL = (typeof process !== 'undefined' && process.env?.API_URL) || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const NotesService = {
  getAll: async () => (await api.get<Note[]>('/notes')).data,
  create: async (note: Partial<Note>) => (await api.post<Note>('/notes', note)).data,
  update: async (id: string, note: Partial<Note>) => (await api.put<Note>(`/notes/${id}`, note)).data,
  delete: async (id: string) => (await api.delete(`/notes/${id}`)).data,
};

export const RemindersService = {
  getAll: async () => (await api.get<Reminder[]>('/reminders')).data,
  create: async (reminder: Partial<Reminder>) => (await api.post<Reminder>('/reminders', reminder)).data,
  toggleComplete: async (id: string) => (await api.patch<Reminder>(`/reminders/${id}/toggle`)).data,
  delete: async (id: string) => (await api.delete(`/reminders/${id}`)).data,
};

export const FinanceService = {
  getSummary: async () => (await api.get('/finance/summary')).data,
  getTransactions: async () => (await api.get<Transaction[]>('/transactions')).data,
  createTransaction: async (tx: Partial<Transaction>) => (await api.post<Transaction>('/transactions', tx)).data,
};

export const HealthService = {
  getLogs: async () => (await api.get<HealthLog[]>('/health')).data,
  logEntry: async (entry: Partial<HealthLog>) => (await api.post<HealthLog>('/health', entry)).data,
};

export default api;
