
import React, { useState } from 'react';
import { Menu, Eye, EyeOff, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarModule from './components/modules/CalendarModule';
import NotesModule from './components/modules/NotesModule';
import HabitsModule from './components/modules/HabitsModule';
import RemindersModule from './components/modules/RemindersModule';
import SettingsModule from './components/modules/SettingsModule';
import HealthModule from './components/modules/HealthModule';
import FinanceModule from './components/modules/FinanceModule';
import IslamicModule from './components/modules/IslamicModule';
import AuthPage from './components/auth/AuthPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isPrivacyMode, togglePrivacyMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 size={40} className="text-brand-600 animate-spin" />
      </div>
    );
  }

  // If not authenticated, show Auth Page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'calendar':
        return <CalendarModule />;
      case 'notes':
        return <NotesModule />;
      case 'habits':
        return <HabitsModule />;
      case 'reminders':
        return <RemindersModule />;
      case 'health':
        return <HealthModule />;
      case 'finance':
        return <FinanceModule />;
      case 'islamic':
        return <IslamicModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-2 capitalize">{activeTab}</h2>
              <p>This module is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Mobile Header - Sticky with safe area padding */}
        <header className="lg:hidden h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <Menu size={24} />
            </button>
            <span className="ml-3 font-semibold text-lg text-slate-900">HayatOS</span>
          </div>

          {/* Mobile Privacy Toggle */}
          <button 
            onClick={togglePrivacyMode}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg active:bg-slate-200 transition-colors"
            title={isPrivacyMode ? "Show Sensitive Content" : "Hide Sensitive Content"}
          >
            {isPrivacyMode ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom)] scroll-smooth bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ConfigProvider>
          <AppContent />
        </ConfigProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;