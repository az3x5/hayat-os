
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Briefcase, User, BookOpen, Lightbulb, Activity, DollarSign, Moon, 
  Coffee, Car, ShoppingBag, Zap, Shield, Heart, Footprints, Droplets, Dumbbell, Weight
} from 'lucide-react';

// Define shapes for config items
export interface ConfigItem {
  id: string;
  label: string;
  icon: any; // Lucide Icon component
  color: string;
  count?: number; // Optional, for display
  active?: boolean; // For metrics
  unit?: string; // For metrics
}

interface ConfigContextType {
  folders: ConfigItem[];
  lists: ConfigItem[];
  metrics: ConfigItem[];
  financeCategories: ConfigItem[];
  areas: ConfigItem[];
  addFolder: (item: ConfigItem) => void;
  updateFolder: (item: ConfigItem) => void;
  deleteFolder: (id: string) => void;
  addList: (item: ConfigItem) => void;
  updateList: (item: ConfigItem) => void;
  deleteList: (id: string) => void;
  addMetric: (item: ConfigItem) => void;
  updateMetric: (item: ConfigItem) => void;
  deleteMetric: (id: string) => void;
  addFinanceCategory: (item: ConfigItem) => void;
  updateFinanceCategory: (item: ConfigItem) => void;
  deleteFinanceCategory: (id: string) => void;
  addArea: (item: ConfigItem) => void;
  updateArea: (item: ConfigItem) => void;
  deleteArea: (id: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial Data (Moved from SettingsModule)
  const [folders, setFolders] = useState<ConfigItem[]>([
     { id: 'work', label: 'Work Projects', icon: Briefcase, color: 'blue' },
     { id: 'personal', label: 'Personal', icon: User, color: 'indigo' },
     { id: 'journal', label: 'Journal', icon: BookOpen, color: 'rose' },
     { id: 'ideas', label: 'Ideas & Brainstorm', icon: Lightbulb, color: 'amber' },
  ]);

  const [lists, setLists] = useState<ConfigItem[]>([
     { id: 'work', label: 'Work', icon: Briefcase, color: 'blue', count: 5 },
     { id: 'personal', label: 'Personal', icon: User, color: 'indigo', count: 3 },
     { id: 'health', label: 'Health', icon: Activity, color: 'emerald', count: 2 },
     { id: 'finance', label: 'Finance', icon: DollarSign, color: 'amber', count: 1 },
     { id: 'islamic', label: 'Islamic', icon: Moon, color: 'teal', count: 4 },
  ]);

  const [metrics, setMetrics] = useState<ConfigItem[]>([
      { id: 'weight', label: 'Weight', unit: 'kg', icon: Weight, color: 'blue', active: true },
      { id: 'steps', label: 'Steps', unit: 'steps', icon: Footprints, color: 'orange', active: true },
      { id: 'sleep', label: 'Sleep', unit: 'hrs', icon: Moon, color: 'indigo', active: true },
      { id: 'water', label: 'Water', unit: 'ml', icon: Droplets, color: 'cyan', active: true },
      { id: 'bp', label: 'Heart Rate', unit: 'bpm', icon: Heart, color: 'rose', active: true },
      { id: 'exercise', label: 'Exercise', unit: 'mins', icon: Dumbbell, color: 'emerald', active: false },
  ]);

  const [financeCategories, setFinanceCategories] = useState<ConfigItem[]>([
      { id: 'food', label: 'Food & Dining', icon: Coffee, color: 'orange' },
      { id: 'transport', label: 'Transport', icon: Car, color: 'blue' },
      { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'purple' },
      { id: 'bills', label: 'Bills & Utilities', icon: Zap, color: 'red' },
      { id: 'salary', label: 'Salary/Income', icon: Briefcase, color: 'emerald' },
      { id: 'health', label: 'Health', icon: Activity, color: 'rose' },
  ]);

  const [areas, setAreas] = useState<ConfigItem[]>([
      { id: 'health', label: 'Health & Fitness', icon: Activity, color: 'emerald', count: 3 },
      { id: 'work', label: 'Work & Productivity', icon: Briefcase, color: 'blue', count: 2 },
      { id: 'islamic', label: 'Islamic & Spiritual', icon: Moon, color: 'teal', count: 4 },
      { id: 'personal', label: 'Personal Growth', icon: User, color: 'indigo', count: 1 },
  ]);

  // Generic CRUD helpers
  const addItem = (setter: React.Dispatch<React.SetStateAction<ConfigItem[]>>) => (item: ConfigItem) => {
    setter(prev => [...prev, item]);
  };
  const updateItem = (setter: React.Dispatch<React.SetStateAction<ConfigItem[]>>) => (item: ConfigItem) => {
    setter(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const deleteItem = (setter: React.Dispatch<React.SetStateAction<ConfigItem[]>>) => (id: string) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  const value = {
    folders,
    lists,
    metrics,
    financeCategories,
    areas,
    addFolder: addItem(setFolders),
    updateFolder: updateItem(setFolders),
    deleteFolder: deleteItem(setFolders),
    addList: addItem(setLists),
    updateList: updateItem(setLists),
    deleteList: deleteItem(setLists),
    addMetric: addItem(setMetrics),
    updateMetric: updateItem(setMetrics),
    deleteMetric: deleteItem(setMetrics),
    addFinanceCategory: addItem(setFinanceCategories),
    updateFinanceCategory: updateItem(setFinanceCategories),
    deleteFinanceCategory: deleteItem(setFinanceCategories),
    addArea: addItem(setAreas),
    updateArea: updateItem(setAreas),
    deleteArea: deleteItem(setAreas),
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
