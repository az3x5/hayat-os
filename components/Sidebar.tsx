import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  NotebookPen, 
  Bell, 
  CheckCircle, 
  Activity, 
  DollarSign, 
  Moon, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'habits', label: 'Habits', icon: CheckCircle },
  { id: 'health', label: 'Health', icon: Activity },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'islamic', label: 'Islamic', icon: Moon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { isPrivacyMode, togglePrivacyMode, theme, setThemeMode } = useTheme();
  const { logout, user } = useAuth();

  const toggleTheme = () => {
    setThemeMode(theme.mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-static-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 
          transition-transform duration-300 ease-in-out pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          shadow-2xl lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full relative">
          {/* Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-9 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-slate-600 hidden lg:flex z-40"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Header */}
          <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-100 transition-all overflow-hidden shrink-0`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-700">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className={`text-xl font-bold text-slate-900 tracking-tight transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>HayatOS</span>
            </div>
          </div>

          {/* User Profile Snippet */}
          {!isCollapsed && user && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 bg-slate-100/50">
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-white shadow-sm">
                    {user.name.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                 </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] group
                    ${isActive 
                      ? 'bg-slate-100 text-brand-700' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              title={isCollapsed ? (theme.mode === 'dark' ? "Light Mode" : "Dark Mode") : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${isCollapsed ? 'justify-center' : ''}`}
            >
              {theme.mode === 'dark' ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                {theme.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Privacy Toggle */}
            <button 
              onClick={togglePrivacyMode}
              title={isCollapsed ? (isPrivacyMode ? "Show Content" : "Hide Sensitive Content") : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${isPrivacyMode ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isPrivacyMode ? <EyeOff size={20} className="flex-shrink-0" /> : <Eye size={20} className="flex-shrink-0" />}
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                {isPrivacyMode ? 'Hidden' : 'Visible'}
              </span>
            </button>

            {/* Logout */}
            <button 
              onClick={logout}
              title={isCollapsed ? "Sign Out" : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 active:bg-red-50 active:scale-[0.98] transition-all ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;