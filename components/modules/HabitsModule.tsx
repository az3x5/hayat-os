import React, { useState, useEffect } from 'react';
import {
   Check,
   X,
   ChevronLeft,
   ChevronRight,
   Plus,
   Flame,
   Calendar as CalendarIcon,
   MoreHorizontal,
   Brain,
   BookOpen,
   Ban,
   Briefcase,
   Moon,
   Activity,
   CheckCircle,
   Archive,
   Edit,
   Trash2,
   PanelLeft,
   MoreVertical,
   LayoutGrid,
   List,
   Layers,
   User,
   Filter
} from 'lucide-react';
import {
   format,
   addDays,
   isSameDay,
   eachDayOfInterval,
   endOfMonth,
   isToday
} from 'date-fns';
import { Habit } from '../../types';
import { HabitsService } from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal';

// Helper for startOfMonth
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

type ViewMode = 'daily' | 'monthly';
type CategoryFilter = 'all' | 'health' | 'work' | 'personal' | 'islamic' | 'archived';

const HabitsModule: React.FC = () => {
   const [habits, setHabits] = useState<Habit[]>([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('daily');
   const [currentDate, setCurrentDate] = useState(new Date());
   const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
   const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

   // Layout State
   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   // Add/Edit Modal State
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

   // Delete Confirmation State
   const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

   // Form State
   const [habitName, setHabitName] = useState('');
   const [habitCategory, setHabitCategory] = useState('Health');
   const [habitFrequency, setHabitFrequency] = useState('Daily');
   const [habitColor, setHabitColor] = useState('emerald');
   const [habitIcon, setHabitIcon] = useState('Activity');

   // Stats
   const completedToday = habits.filter(h => h.completed).length;
   const totalActive = habits.filter(h => h.status === 'active').length;
   const progressPercentage = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0;

   // Filters
   const filteredHabits = habits.filter(h => {
      if (selectedCategory === 'archived') return h.status === 'archived';

      // For other tabs, show only active habits
      if (h.status === 'archived') return false;

      if (selectedCategory === 'all') return true;
      return h.category === selectedCategory;
   });

   // Calculate days for the currently selected month
   const monthStart = startOfMonth(currentDate);
   const monthEnd = endOfMonth(currentDate);
   const monthDays = eachDayOfInterval({
      start: monthStart,
      end: monthEnd
   });

   // Fetch Habits
   useEffect(() => {
      const fetchHabits = async () => {
         try {
            setLoading(true);
            const fetched = await HabitsService.getAll();
            // Map backend 'logs' to frontend 'history'
            const mapped = fetched.map((h: any) => ({
               ...h,
               history: h.logs ? h.logs.map((l: any) => ({
                  date: typeof l.date === 'string' ? l.date.split('T')[0] : format(new Date(l.date), 'yyyy-MM-dd'),
                  status: l.status
               })) : [],
               // Recalculate streak/completion if needed or trust backend?
               // For now, trust backend values or basic defaults if missing
               streak: h.streak || 0,
               completed: h.logs?.some((l: any) =>
                  (typeof l.date === 'string' ? l.date.startsWith(format(new Date(), 'yyyy-MM-dd')) : isSameDay(new Date(l.date), new Date())) && l.status === 'completed'
               ) || false
            }));
            setHabits(mapped);
         } catch (err) {
            console.error('Failed to fetch habits', err);
         } finally {
            setLoading(false);
         }
      };
      fetchHabits();
   }, []);

   // Handlers
   const toggleHabitToday = async (id: string) => {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const isNowCompleted = !habit.completed;

      // Optimistic UI
      setHabits(prev => prev.map(h => {
         if (h.id === id) {
            let newHistory = [...h.history];
            const existIdx = newHistory.findIndex(l => l.date === todayStr);
            if (isNowCompleted) {
               if (existIdx >= 0) newHistory[existIdx].status = 'completed';
               else newHistory.push({ date: todayStr, status: 'completed' });
            } else {
               if (existIdx >= 0) newHistory.splice(existIdx, 1);
            }
            return { ...h, completed: isNowCompleted, history: newHistory, streak: isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1) };
         }
         return h;
      }));

      // API
      try {
         await HabitsService.logStatus(id, todayStr, isNowCompleted ? 'completed' : 'none');
      } catch (err) {
         console.error('Failed to toggle habit', err);
         // Revert (simplified)
         // fetchHabits(); 
      }
   };

   const toggleHistoryLog = async (habitId: string, date: Date) => {
      if (date > new Date()) return;

      const dateKey = format(date, 'yyyy-MM-dd');
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      let newStatus: 'completed' | 'skipped' | 'missed' | 'none' = 'completed';
      const existingLog = habit.history.find(l => l.date === dateKey);

      // Cycle logic
      if (existingLog) {
         if (existingLog.status === 'completed') newStatus = 'skipped';
         else if (existingLog.status === 'skipped') newStatus = 'missed';
         else if (existingLog.status === 'missed') newStatus = 'none';
      }

      // Optimistic
      setHabits(prev => prev.map(h => {
         if (h.id === habitId) {
            let newHistory = [...h.history];
            const idx = newHistory.findIndex(l => l.date === dateKey);

            if (newStatus === 'none') {
               if (idx >= 0) newHistory.splice(idx, 1);
            } else {
               if (idx >= 0) newHistory[idx] = { ...newHistory[idx], status: newStatus as any };
               else newHistory.push({ date: dateKey, status: newStatus as any });
            }

            const isTodayUpdate = isSameDay(date, new Date());
            return {
               ...h,
               history: newHistory,
               completed: isTodayUpdate ? newStatus === 'completed' : h.completed
            };
         }
         return h;
      }));

      // API
      try {
         await HabitsService.logStatus(habitId, dateKey, newStatus);
      } catch (err) {
         console.error('Failed to log status', err);
      }
   };

   const toggleArchiveStatus = (id: string) => {
      setHabits(habits.map(h => {
         if (h.id === id) {
            return { ...h, status: h.status === 'active' ? 'archived' : 'active' };
         }
         return h;
      }));

      if (selectedHabit && selectedHabit.id === id) {
         setSelectedHabit(null); // Close modal
      }
   };

   const initiateDelete = (id: string) => {
      setHabitToDelete(id);
      if (selectedHabit) setSelectedHabit(null);
      if (isAddModalOpen) setIsAddModalOpen(false);
   };

   const confirmDelete = async () => {
      if (habitToDelete) {
         const id = habitToDelete;
         setHabits(prev => prev.filter(h => h.id !== id));
         setHabitToDelete(null);

         try {
            await HabitsService.delete(id);
         } catch (err) {
            console.error('Failed to delete habit', err);
            // Restore?
            const fetchAgain = await HabitsService.getAll();
            // ... simplified restore: just reload page if needed
         }
      }
   };

   const openAddModal = () => {
      setEditingHabitId(null);
      setHabitName('');
      setHabitCategory('Health');
      setHabitFrequency('Daily');
      setHabitColor('emerald');
      setHabitIcon('Activity');
      setIsAddModalOpen(true);
   };

   const openEditModal = (habit: Habit) => {
      setEditingHabitId(habit.id);
      setHabitName(habit.name);
      setHabitCategory(habit.category.charAt(0).toUpperCase() + habit.category.slice(1));
      setHabitFrequency(habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1));
      setHabitColor(habit.color);
      setHabitIcon(habit.icon || 'Activity');
      setSelectedHabit(null); // Close details modal
      setIsAddModalOpen(true);
   };

   const handleSaveHabit = async () => {
      if (!habitName) return;

      const habitData = {
         name: habitName,
         category: habitCategory.toLowerCase() as any,
         frequency: habitFrequency.toLowerCase() as any,
         color: habitColor,
         icon: habitIcon
      };

      if (editingHabitId) {
         // Optimistic
         setHabits(habits.map(h => h.id === editingHabitId ? { ...h, ...habitData } : h));
         setIsAddModalOpen(false);
         try {
            await HabitsService.update(editingHabitId, habitData);
         } catch (err) {
            console.error(err);
         }
      } else {
         // Create
         // Must wait for ID from server
         setIsAddModalOpen(false);
         try {
            const newHabit = await HabitsService.create({
               ...habitData,
               streak: 0,
               status: 'active'
            });
            // Map history if needed (will be empty)
            setHabits([...habits, { ...newHabit, history: [], completed: false }]);
         } catch (err) {
            console.error(err);
         }
      }
   };

   const getIcon = (iconName?: string, size: number = 20) => {
      switch (iconName) {
         case 'Brain': return <Brain size={size} />;
         case 'BookOpen': return <BookOpen size={size} />;
         case 'Ban': return <Ban size={size} />;
         case 'Briefcase': return <Briefcase size={size} />;
         case 'Moon': return <Moon size={size} />;
         case 'Calendar': return <CalendarIcon size={size} />;
         case 'CheckCircle': return <CheckCircle size={size} />;
         default: return <Activity size={size} />;
      }
   };

   const getColorClasses = (color: string) => {
      switch (color) {
         case 'emerald': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', bar: 'bg-emerald-500' };
         case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', bar: 'bg-blue-500' };
         case 'rose': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', bar: 'bg-rose-500' };
         case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', bar: 'bg-indigo-500' };
         case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', bar: 'bg-amber-500' };
         case 'slate': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', bar: 'bg-slate-500' };
         default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', bar: 'bg-slate-500' };
      }
   };

   const AVAILABLE_ICONS = ['Activity', 'Brain', 'BookOpen', 'Briefcase', 'Moon', 'Ban', 'Calendar', 'CheckCircle'];

   return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

         {/* Sidebar */}
         <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-40 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
            <div className="w-64 h-full flex flex-col">
               {/* Header */}
               <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <CheckCircle className="text-emerald-600" size={24} />
                     Habits
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Track & Build Routines</p>
               </div>

               <div className="flex-1 overflow-y-auto p-3 space-y-6">
                  {/* Views */}
                  <div className="space-y-1">
                     <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Views</div>
                     <button
                        onClick={() => { setViewMode('daily'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                        <LayoutGrid size={18} className={viewMode === 'daily' ? 'text-emerald-500' : 'text-slate-400'} />
                        Daily Grid
                     </button>
                     <button
                        onClick={() => { setViewMode('monthly'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                        <CalendarIcon size={18} className={viewMode === 'monthly' ? 'text-emerald-500' : 'text-slate-400'} />
                        Monthly Table
                     </button>
                  </div>

                  {/* Filters */}
                  <div className="space-y-1">
                     <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</div>
                     {[
                        { id: 'all', label: 'All Habits', icon: Layers },
                        { id: 'health', label: 'Health', icon: Activity },
                        { id: 'work', label: 'Work', icon: Briefcase },
                        { id: 'personal', label: 'Personal', icon: User },
                        { id: 'islamic', label: 'Islamic', icon: Moon },
                        { id: 'archived', label: 'Archived', icon: Archive }
                     ].map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        const Icon = cat.icon;
                        // Count logic
                        const count = cat.id === 'archived'
                           ? habits.filter(h => h.status === 'archived').length
                           : cat.id === 'all'
                              ? habits.filter(h => h.status === 'active').length
                              : habits.filter(h => h.status === 'active' && h.category === cat.id).length;

                        return (
                           <button
                              key={cat.id}
                              onClick={() => { setSelectedCategory(cat.id as CategoryFilter); setMobileMenuOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                           >
                              <div className="flex items-center gap-3">
                                 <Icon size={18} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                                 <span>{cat.label}</span>
                              </div>
                              {count > 0 && <span className="text-xs font-semibold text-slate-400">{count}</span>}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Header */}
            <div className="h-16 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg active:bg-slate-200"
                  >
                     <MoreVertical size={20} />
                  </button>
                  <button
                     onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                     className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                     title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                  >
                     <PanelLeft size={20} />
                  </button>

                  {/* Month Navigation */}
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => setCurrentDate(addDays(currentDate, -30))}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                     >
                        <ChevronLeft size={18} />
                     </button>
                     <span className="text-lg font-bold text-slate-900 min-w-[140px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                     <button
                        onClick={() => setCurrentDate(addDays(currentDate, 30))}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                     >
                        <ChevronRight size={18} />
                     </button>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  {/* Progress Summary (Desktop) */}
                  <div className="hidden lg:flex items-center gap-3 mr-2">
                     <div className="text-right">
                        <div className="text-xs font-semibold text-slate-500">Today's Progress</div>
                        <div className="text-sm font-bold text-slate-900">{completedToday}/{totalActive} Completed</div>
                     </div>
                     <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                           <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                           <path className="text-emerald-500 transition-all duration-500 ease-out" strokeDasharray={`${progressPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-slate-700">{progressPercentage}%</span>
                     </div>
                  </div>

                  <button
                     onClick={openAddModal}
                     className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
                  >
                     <Plus size={18} />
                     <span className="hidden sm:inline">Add Habit</span>
                  </button>
               </div>
            </div>

            {/* Content */}
            {/* Conditional container styling: Scrollable for Daily, Fixed for Monthly to allow internal scroll */}
            <div className={`flex-1 flex flex-col min-h-0 bg-slate-50/30 ${viewMode === 'daily' ? 'overflow-y-auto p-4 md:p-6' : 'overflow-hidden'}`}>
               {viewMode === 'daily' ? (
                  filteredHabits.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredHabits.map((habit) => {
                           const styles = getColorClasses(habit.color);
                           // Ensure heat map data includes today if completed
                           const todayStr = format(new Date(), 'yyyy-MM-dd');
                           let displayHistory = [...habit.history];
                           if (habit.completed && !displayHistory.find(h => h.date === todayStr)) {
                              displayHistory.push({ date: todayStr, status: 'completed' });
                           } else if (!habit.completed) {
                              displayHistory = displayHistory.filter(h => h.date !== todayStr);
                           }

                           return (
                              <div
                                 key={habit.id}
                                 onClick={() => setSelectedHabit(habit)}
                                 className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden active:scale-[0.99]"
                              >
                                 {/* Status Toggle (Absolute) - Only show if not archived */}
                                 {habit.status !== 'archived' && (
                                    <div className="absolute top-5 right-5 z-10">
                                       <button
                                          onClick={(e) => { e.stopPropagation(); toggleHabitToday(habit.id); }}
                                          className={`
                              w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                              ${habit.completed
                                                ? `${styles.bg.replace('50', '500')} text-white shadow-md scale-100`
                                                : 'bg-slate-50 text-slate-300 hover:bg-slate-100 border border-slate-100'
                                             }
                            `}
                                       >
                                          <Check size={16} strokeWidth={3} />
                                       </button>
                                    </div>
                                 )}

                                 <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-xl ${styles.bg} ${styles.text}`}>
                                       {getIcon(habit.icon)}
                                    </div>
                                    <div className="pr-8">
                                       <h3 className="font-bold text-slate-900 truncate">{habit.name}</h3>
                                       <p className="text-xs text-slate-500 mt-1 capitalize">{habit.frequency} • {habit.category}</p>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-4 mt-6">
                                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                       <Flame size={14} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300"} />
                                       <span className="text-xs font-bold">{habit.streak} Day Streak</span>
                                    </div>

                                    {/* Mini Heatmap Preview (Last 7 days) */}
                                    <div className="flex items-center gap-1 ml-auto">
                                       {displayHistory.slice(0, 5).reverse().map((log, i) => (
                                          <div
                                             key={i}
                                             className={`w-1.5 h-6 rounded-full ${log.status === 'completed' ? styles.bar :
                                                log.status === 'skipped' ? 'bg-slate-300' : 'bg-slate-100'
                                                }`}
                                             title={log.date}
                                          />
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center py-10">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                           <Archive size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{selectedCategory === 'archived' ? 'No archived habits' : 'No habits found'}</h3>
                        <p className="text-slate-500 mt-1 max-w-xs">{selectedCategory === 'archived' ? 'Habits you archive will appear here.' : 'Create a new habit to get started.'}</p>
                     </div>
                  )
               ) : (
                  <div className="h-full flex flex-col p-4 md:p-6">
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 relative">
                        <div className="overflow-auto flex-1 w-full">
                           {/* Using border-separate to ensure sticky headers work correctly */}
                           <table className="w-full text-left border-separate border-spacing-0">
                              <thead className="bg-slate-50 text-slate-500 h-14">
                                 <tr>
                                    {/* Z-Index 40 for the corner cell to stay on top of both row and column headers */}
                                    <th className="p-4 font-semibold text-sm w-64 sticky left-0 top-0 z-40 bg-slate-50 border-r border-slate-200 border-b shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Habit</th>
                                    {monthDays.map((day) => {
                                       const isDayToday = isToday(day);
                                       return (
                                          /* Z-Index 30 for the header row */
                                          <th key={day.toISOString()} className={`sticky top-0 z-30 p-2 text-center text-[10px] font-medium min-w-[40px] border-l border-b border-slate-100 ${isDayToday ? 'text-slate-900 font-bold bg-blue-50/50' : 'text-slate-400 bg-slate-50'}`}>
                                             <div className="flex flex-col items-center gap-0.5">
                                                <span>{format(day, 'd')}</span>
                                                <span className="text-[9px] font-normal opacity-50 uppercase">{format(day, 'eee')}</span>
                                             </div>
                                          </th>
                                       );
                                    })}
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {filteredHabits.map((habit) => {
                                    const styles = getColorClasses(habit.color);

                                    return (
                                       <tr key={habit.id} className="group hover:bg-slate-50/30 transition-colors">
                                          {/* Z-Index 20 for the first column to stay on top of regular cells */}
                                          <td className="p-3 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-20 border-r border-slate-100 border-b shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                             <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${styles.bg} ${styles.text} shrink-0`}>
                                                   {getIcon(habit.icon)}
                                                </div>
                                                <span className="font-medium text-sm text-slate-900 truncate max-w-[160px]" title={habit.name}>{habit.name}</span>
                                             </div>
                                          </td>
                                          {monthDays.map((day) => {
                                             const dateKey = format(day, 'yyyy-MM-dd');
                                             const log = habit.history.find(h => h.date === dateKey);
                                             let status = log?.status;

                                             const isFutureDate = day > new Date();
                                             const isTodayDate = isSameDay(day, new Date());

                                             if (!status && !isFutureDate) {
                                                if (isTodayDate) {
                                                   status = habit.completed ? 'completed' : undefined;
                                                }
                                             }

                                             return (
                                                <td
                                                   key={day.toISOString()}
                                                   onClick={() => toggleHistoryLog(habit.id, day)}
                                                   className={`
                                             p-1 text-center border-l border-b border-slate-50 cursor-pointer transition-colors
                                             ${isTodayDate ? 'bg-blue-50/10' : ''}
                                             ${!isFutureDate ? 'hover:bg-slate-100' : ''}
                                          `}
                                                >
                                                   <div className={`
                                             w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all
                                             ${status === 'completed' ? styles.bg + ' ' + styles.text : ''}
                                             ${status === 'skipped' ? 'bg-slate-100 text-slate-400' : ''}
                                             ${status === 'missed' ? 'bg-red-50 text-red-300' : ''}
                                             ${!status && !isFutureDate ? 'hover:bg-slate-200 text-transparent hover:text-slate-400' : ''}
                                          `}>
                                                      {status === 'completed' && <Check size={16} strokeWidth={3} />}
                                                      {status === 'skipped' && <MoreHorizontal size={16} />}
                                                      {status === 'missed' && <X size={16} />}
                                                      {!status && !isFutureDate && <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-300" />}
                                                   </div>
                                                </td>
                                             );
                                          })}
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Habit Details Modal */}
         {selectedHabit && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedHabit(null)} />
               <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">

                  <div className={`h-32 ${getColorClasses(selectedHabit.color).bg} p-6 relative shrink-0`}>
                     <button
                        onClick={() => setSelectedHabit(null)}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                     >
                        <X size={20} className="text-slate-600" />
                     </button>
                     <div className="flex items-end gap-4 h-full translate-y-8">
                        <div className={`w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center ${getColorClasses(selectedHabit.color).text}`}>
                           {getIcon(selectedHabit.icon, 40)}
                        </div>
                        <div className="mb-8">
                           <h2 className="text-2xl font-bold text-slate-900">{selectedHabit.name}</h2>
                           <p className="text-slate-600 font-medium capitalize">{selectedHabit.category}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-12 px-6 pb-6 space-y-5 flex-1 overflow-y-auto">
                     <p className="text-slate-600 text-sm leading-relaxed">
                        {selectedHabit.description || "No description provided for this habit."}
                     </p>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 text-center">
                           <div className="text-xs text-slate-500 uppercase font-bold mb-1">Streak</div>
                           <div className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                              {selectedHabit.streak} <Flame size={16} className="text-orange-500 fill-orange-500" />
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 text-center">
                           <div className="text-xs text-slate-500 uppercase font-bold mb-1">Success</div>
                           <div className="text-xl font-bold text-slate-900">85%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 text-center">
                           <div className="text-xs text-slate-500 uppercase font-bold mb-1">Target</div>
                           <div className="text-xl font-bold text-slate-900 capitalize">{selectedHabit.frequency}</div>
                        </div>
                     </div>

                     {/* Calendar Grid Visualization Mock */}
                     <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">History</h4>
                        <div className="flex gap-1 flex-wrap">
                           {Array.from({ length: 30 }).map((_, i) => (
                              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${Math.random() > 0.3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-300'}`}>
                                 {i + 1}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => openEditModal(selectedHabit)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
                           <Edit size={18} /> Edit
                        </button>
                        {selectedHabit.status === 'archived' ? (
                           <button
                              onClick={() => initiateDelete(selectedHabit.id)}
                              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium transition-colors hover:bg-red-100"
                           >
                              <Trash2 size={18} /> Delete
                           </button>
                        ) : (
                           <button
                              onClick={() => toggleArchiveStatus(selectedHabit.id)}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors bg-white border-slate-200 text-slate-600 hover:bg-slate-50`}
                           >
                              <Archive size={18} /> Archive
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Add/Edit Habit Modal */}
         {isAddModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
               <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                     <h3 className="text-xl font-bold text-slate-900">{editingHabitId ? 'Edit Habit' : 'New Habit'}</h3>
                     <button onClick={() => setIsAddModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                        <X size={24} />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Habit Name</label>
                        <input
                           type="text"
                           value={habitName}
                           onChange={(e) => setHabitName(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder-slate-400 text-slate-900"
                           placeholder="e.g., Drink Water"
                           autoFocus
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                           <select
                              value={habitCategory}
                              onChange={(e) => setHabitCategory(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none text-slate-900"
                           >
                              <option>Health</option>
                              <option>Work</option>
                              <option>Personal</option>
                              <option>Islamic</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                           <select
                              value={habitFrequency}
                              onChange={(e) => setHabitFrequency(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none text-slate-900"
                           >
                              <option>Daily</option>
                              <option>Weekly</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Color & Icon</label>
                        <div className="space-y-4">
                           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                              {['emerald', 'blue', 'rose', 'indigo', 'amber', 'slate'].map(color => (
                                 <button
                                    key={color}
                                    onClick={() => setHabitColor(color)}
                                    className={`w-10 h-10 rounded-full bg-${color}-500 ring-offset-2 transition-all ${habitColor === color ? 'ring-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                                 />
                              ))}
                           </div>

                           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {AVAILABLE_ICONS.map(iconName => (
                                 <button
                                    key={iconName}
                                    onClick={() => setHabitIcon(iconName)}
                                    className={`p-3 rounded-xl border transition-all shrink-0 ${habitIcon === iconName ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                    title={iconName}
                                 >
                                    {getIcon(iconName, 20)}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-3xl flex gap-3">
                     {editingHabitId && (
                        <button
                           onClick={() => initiateDelete(editingHabitId)}
                           className="flex-1 bg-red-50 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
                        >
                           Delete
                        </button>
                     )}
                     <button
                        onClick={handleSaveHabit}
                        className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 active:scale-[0.98]"
                     >
                        {editingHabitId ? 'Save Changes' : 'Create Habit'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Confirmation Modal */}
         <ConfirmModal
            isOpen={!!habitToDelete}
            onClose={() => setHabitToDelete(null)}
            onConfirm={confirmDelete}
            title="Delete Habit"
            message="Are you sure you want to delete this habit? This action cannot be undone and will remove all history."
         />

      </div>
   );
};

export default HabitsModule;