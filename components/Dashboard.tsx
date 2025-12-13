
import React, { useState } from 'react';
import { 
  Sparkles, 
  NotebookPen, 
  CheckCircle, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import MiniCalendar from './cards/MiniCalendar';
import NotesCard from './cards/NotesCard';
import RemindersCard from './cards/RemindersCard';
import HabitsCard from './cards/HabitsCard';
import HealthCard from './cards/HealthCard';
import FinanceCard from './cards/FinanceCard';
import IslamicCard from './cards/IslamicCard';
import { generateDailyInsight } from '../services/geminiService';
import { 
  MOCK_NOTES, 
  MOCK_REMINDERS, 
  MOCK_HABITS, 
  MOCK_HEALTH, 
  MOCK_FINANCE,
  MOCK_PRAYER_TIMES 
} from '../constants';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true);
    const text = await generateDailyInsight(MOCK_HABITS, MOCK_HEALTH, MOCK_FINANCE, MOCK_REMINDERS);
    setInsight(text);
    setIsLoadingInsight(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter prayers for today: Show Jumuah ONLY on Friday, Dhuhr on other days
  const today = new Date();
  const isFriday = today.getDay() === 5;
  const todayPrayers = MOCK_PRAYER_TIMES.filter(p => {
    if (p.name === 'Jumuah') return isFriday;
    if (p.name === 'Dhuhr') return !isFriday;
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      {/* Header Area with Gemini Integration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{getGreeting()}, Ali</h1>
          <p className="text-slate-500 mt-1">Here is your daily overview.</p>
        </div>
        
        <div className="flex-1 md:max-w-xl">
           {!insight ? (
             <button 
                onClick={handleGenerateInsight}
                disabled={isLoadingInsight}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 group text-sm font-medium"
             >
                <Sparkles size={16} className={`group-hover:rotate-12 transition-transform ${isLoadingInsight ? "animate-spin" : ""}`} />
                {isLoadingInsight ? "Generating Insight..." : "Get Daily Gemini Insight"}
             </button>
           ) : (
             <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-3 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
                <Sparkles size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                   <p className="text-slate-800 text-sm font-medium leading-relaxed">"{insight}"</p>
                   <div className="flex justify-end mt-1">
                     <button onClick={() => setInsight(null)} className="text-[10px] text-slate-400 hover:text-indigo-600 font-semibold uppercase tracking-wider">Refresh</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => onNavigate('notes')}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all group"
        >
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
            <NotebookPen size={16} />
          </div>
          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">New Note</span>
        </button>

        <button 
          onClick={() => onNavigate('reminders')}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm transition-all group"
        >
          <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
            <CheckCircle size={16} />
          </div>
          <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">New Task</span>
        </button>

        <button 
          onClick={() => onNavigate('finance')}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all group"
        >
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors">
            <DollarSign size={16} />
          </div>
          <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Log Expense</span>
        </button>

        <button 
          onClick={() => onNavigate('calendar')}
          className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm transition-all group"
        >
          <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
            <Calendar size={16} />
          </div>
          <span className="text-sm font-bold text-slate-700 group-hover:text-purple-700">Add Event</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <MiniCalendar onClick={() => onNavigate('calendar')} />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
           <IslamicCard prayers={todayPrayers} onClick={() => onNavigate('islamic')} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
           <RemindersCard reminders={MOCK_REMINDERS} onClick={() => onNavigate('reminders')} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
           <HabitsCard habits={MOCK_HABITS} onClick={() => onNavigate('habits')} />
        </div>

        {/* Row 2 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2">
           <FinanceCard data={MOCK_FINANCE} onClick={() => onNavigate('finance')} />
        </div>
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
           <HealthCard metrics={MOCK_HEALTH} onClick={() => onNavigate('health')} />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <NotesCard notes={MOCK_NOTES} onClick={() => onNavigate('notes')} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
