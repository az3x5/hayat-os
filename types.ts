
export interface Note {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Full content
  timestamp: Date;
  folder: 'work' | 'personal' | 'health' | 'islamic' | 'journal' | 'ideas' | 'trash' | 'archive';
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  color?: string; // Hex code or tailwind class suffix
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health' | 'finance' | 'islamic' | 'general';
  tags?: string[];
  notes?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  status: 'completed' | 'skipped' | 'missed';
}

export interface Habit {
  id: string;
  name: string;
  category: 'health' | 'work' | 'personal' | 'islamic' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  completed: boolean; // Today's status
  streak: number;
  color: string; // tailwind color name like 'emerald', 'blue'
  icon?: string;
  target?: number; // e.g., 5 times a week
  history: HabitLog[];
  status: 'active' | 'archived';
  description?: string;
}

export interface HealthMetric {
  type: 'weight' | 'steps' | 'sleep' | 'bp' | 'water';
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  timestamp: string;
}

export interface HealthLog {
  id: string;
  type: 'weight' | 'steps' | 'sleep' | 'bp' | 'water';
  value: number;
  date: Date;
  note?: string;
}

export interface FinanceSummary {
  balance: number;
  income: number;
  expenses: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'credit';
  balance: number;
  change: number; // percentage change vs last month
  lastUpdated: Date;
  accountNumber?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  account: 'checking' | 'savings' | 'cash' | 'investment' | 'credit';
  notes?: string;
  tags?: string[];
  recurring?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  color: string;
  icon?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date; // Next due date
  isPaid: boolean;
  category: string;
  frequency: 'monthly' | 'yearly';
  autoPay: boolean;
}

export interface Investment {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
  change: number; // percentage
  type: 'stock' | 'crypto' | 'etf' | 'mutual_fund';
}

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: number; // Day of month
  provider: string;
}

export interface PrayerTime {
  name: string;
  time: string; // HH:mm 24h format
}

export interface HijriDate {
  day: number;
  month: string;
  year: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'health' | 'islamic' | 'family';
  date: Date;
  location?: string;
  description?: string;
  color?: string;
}

export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
  audioUrl?: string;
  isFavorite: boolean;
}

// Nested Hadith Structure
export interface HadithNarration {
  id: string;
  number: string; // e.g., "1" or "245a"
  arabic: string;
  translation: string;
  grade: string; // e.g., "Sahih", "Hasan"
  narrator?: string; // e.g., "Narrated 'Umar bin Al-Khattab"
}

export interface HadithChapter {
  id: string;
  number: number;
  title: string; // e.g., "How the Divine Inspiration started"
  arabicTitle?: string;
  narrations: HadithNarration[];
}

export interface HadithBook {
  id: string;
  number: number;
  title: string; // e.g., "Book of Revelation"
  chapters: HadithChapter[];
}

export interface HadithVolume {
  id: string;
  number: number;
  title: string; // e.g., "Volume 1"
  books: HadithBook[];
}

export interface HadithCollection {
  id: string;
  name: string; // e.g., "Sahih Al-Bukhari"
  arabicName?: string;
  totalHadith: number;
  volumes: HadithVolume[];
}

export interface FiqhTopic {
  id: string;
  title: string;
  category: string;
  content: string; // Markdown/HTML content
  audioUrl?: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranVerse {
  id: string;
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  translation: string;
  transliteration?: string;
  dhivehi?: string;
  audioUrl?: string;
}

export interface Reciter {
  id: string;
  name: string;
}

// THEME TYPES
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string; // Page BG (slate-50)
  surface: string;    // Card BG (white)
  primary: string;    // Main Text (slate-900)
  secondary: string;  // Subtext (slate-500)
  border: string;     // Borders (slate-200)
}

export interface AppTheme {
  mode: ThemeMode;
  colors: ThemeColors;
  radius: number; // in pixels (base for rem calculation)
  density: 'compact' | 'standard' | 'spacious';
}