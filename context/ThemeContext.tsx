import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, ThemeColors, ThemeMode } from '../types';

// Standard Tailwind Slate Palette
const SLATE = {
  25: '#fcfcfd', // Extra bright
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475467',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// Standard Tailwind Green Palette (Brand)
const GREEN = {
  25: '#f6fef9',
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d', // Requested Primary Theme Color
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
};

// Standard Semantic Colors (Tailwind Defaults)
const SEMANTIC_COLORS = {
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
  cyan: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
};

// Helper to invert brand/semantic colors for dark mode visibility
const invertPalette = (colors: any) => {
  return {
    25: colors[950],
    50: colors[950],
    100: colors[900],
    200: colors[800],
    300: colors[700],
    400: colors[600], 
    500: colors[500],
    600: colors[400],
    700: colors[300],
    800: colors[200],
    900: colors[100],
    950: colors[50],
  };
};

// --- THEME DEFINITIONS ---

const LIGHT_PALETTE = {
  white: '#ffffff',
  black: '#000000',
  
  slate: SLATE,
  brand: GREEN,
  
  ...SEMANTIC_COLORS
};

// Dark Mode Strategy:
// We map standard classes to dark values. 
// "bg-white" (Card) -> slate-800 (#1e293b)
// "bg-slate-50" (Page BG) -> slate-900 (#0f172a)
// "hover:bg-slate-100" (Highlight) -> slate-700 (#334155) - Lighter than Card!
const DARK_PALETTE = {
  white: SLATE[800], // Cards become Slate-800
  black: '#ffffff',  // Black text becomes White
  
  slate: {
    25: SLATE[950], // Defined explicitly for Slate
    50: SLATE[900], 
    100: SLATE[700], // Hover state (Lighter than 800)
    200: SLATE[600], // Borders
    300: SLATE[500], // Icons / Muted Text
    400: SLATE[400],
    500: SLATE[300],
    600: SLATE[200],
    700: SLATE[100],
    800: SLATE[50],
    900: SLATE[25], // Primary Text (Brightest)
    950: '#ffffff',
  },

  brand: invertPalette(GREEN),
  
  blue: invertPalette(SEMANTIC_COLORS.blue),
  emerald: invertPalette(SEMANTIC_COLORS.emerald),
  rose: invertPalette(SEMANTIC_COLORS.rose),
  amber: invertPalette(SEMANTIC_COLORS.amber),
  indigo: invertPalette(SEMANTIC_COLORS.indigo),
  purple: invertPalette(SEMANTIC_COLORS.purple),
  teal: invertPalette(SEMANTIC_COLORS.teal),
  cyan: invertPalette(SEMANTIC_COLORS.cyan),
  orange: invertPalette(SEMANTIC_COLORS.orange),
};

interface ThemeContextType {
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setRadius: (radius: number) => void;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifeos_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    }
    return 'system';
  });
  const [radius, setRadius] = useState(16);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    let activePalette = LIGHT_PALETTE;
    let isDark = false;
    
    // Determine if we should be dark
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply Palette
    activePalette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
    
    // Toggle Tailwind 'dark' class for manual overrides if needed
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Save Preference
    localStorage.setItem('lifeos_theme', mode);

    const root = document.documentElement;
    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.style.setProperty('--radius', `${radius}px`);

    // Helper to set CSS Variables
    const applyVars = (prefix: string, obj: any) => {
      Object.entries(obj).forEach(([key, value]) => {
         root.style.setProperty(`--color-${prefix}-${key}`, value as string);
      });
    };

    // Apply Base Colors
    root.style.setProperty('--color-white', activePalette.white);
    root.style.setProperty('--color-black', activePalette.black);

    // Apply Scales
    applyVars('slate', activePalette.slate);
    applyVars('brand', activePalette.brand);
    
    // Apply Semantics
    applyVars('blue', activePalette.blue);
    applyVars('emerald', activePalette.emerald);
    applyVars('rose', activePalette.rose);
    applyVars('amber', activePalette.amber);
    applyVars('indigo', activePalette.indigo);
    applyVars('purple', activePalette.purple);
    applyVars('teal', activePalette.teal);
    applyVars('cyan', activePalette.cyan);
    applyVars('orange', activePalette.orange);

    // System listener
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newIsDark = e.matches;
        const newPalette = newIsDark ? DARK_PALETTE : LIGHT_PALETTE;
        
        if (newIsDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        
        root.style.colorScheme = newIsDark ? 'dark' : 'light';
        root.style.setProperty('--color-white', newPalette.white);
        root.style.setProperty('--color-black', newPalette.black);
        
        applyVars('slate', newPalette.slate);
        applyVars('brand', newPalette.brand);
        applyVars('blue', newPalette.blue);
        applyVars('emerald', newPalette.emerald);
        applyVars('rose', newPalette.rose);
        applyVars('amber', newPalette.amber);
        applyVars('indigo', newPalette.indigo);
        applyVars('purple', newPalette.purple);
        applyVars('teal', newPalette.teal);
        applyVars('cyan', newPalette.cyan);
        applyVars('orange', newPalette.orange);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

  }, [mode, radius]);

  const value = {
    theme: {
      mode,
      colors: { background: '', surface: '', primary: '', secondary: '', border: '' }, 
      radius,
      density: 'standard' as const,
    },
    setThemeMode: setMode,
    setRadius,
    isPrivacyMode,
    togglePrivacyMode: () => setIsPrivacyMode(prev => !prev)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};