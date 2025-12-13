import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Flag, 
  CheckCircle, 
  Plus, 
  Search, 
  Briefcase, 
  User, 
  Activity, 
  DollarSign, 
  Moon, 
  Layers,
  Calendar as CalendarIcon,
  X,
  Trash2,
  PanelLeft,
  MoreVertical,
  Tag,
  Edit2,
  LayoutGrid,
  List,
  Clock,
  Repeat,
  AlignLeft,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, isToday, isTomorrow, isFuture, isPast } from 'date-fns';
import { Reminder } from '../../types';
import { MOCK_REMINDERS } from '../../constants';
import DatePicker from '../ui/DatePicker';
import TimeSelect from '../ui/TimeSelect';
import { useConfig } from '../../context/ConfigContext';
import ConfirmModal from '../ui/ConfirmModal';

type FilterType = 'all' | 'today' | 'scheduled' | 'flagged' | 'completed';
type CategoryType = 'work' | 'personal' | 'health' | 'finance' | 'islamic' | 'general' | null;

const RemindersModule: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Layout State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // View State
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);
  
  // Confirmation State
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  // Consume Config for Lists
  const { lists } = useConfig();

  // New/Edit Reminder Form State
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDateDate, setNewDateDate] = useState<Date>(new Date());
  const [newDateTime, setNewDateTime] = useState<string>('09:00');
  const [newPriority, setNewPriority] = useState<'low'|'medium'|'high'>('medium');
  const [newCategory, setNewCategory] = useState<string>('personal');
  const [newNotes, setNewNotes] = useState('');
  const [newRecurrence, setNewRecurrence] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');

  // Filtering Logic
  const filteredReminders = reminders.filter(r => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeCategory && r.category !== activeCategory) return false;
    if (activeFilter === 'completed') return r.completed;
    if (r.completed) return false;

    switch (activeFilter) {
      case 'today': return isToday(r.dueDate);
      case 'scheduled': return isFuture(r.dueDate);
      case 'flagged': return r.priority === 'high';
      default: return true;
    }
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  // Actions
  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const toggleExpand = (id: string) => {
    setExpandedReminderId(expandedReminderId === id ? null : id);
  };

  const initiateDelete = (id: string) => {
    setReminderToDelete(id);
  };

  const confirmDelete = () => {
    if (reminderToDelete) {
      setReminders(reminders.filter(r => r.id !== reminderToDelete));
      setReminderToDelete(null);
    }
  };

  const openAddModal = () => {
     setEditingReminder(null);
     setNewTitle('');
     setNewDateDate(new Date());
     setNewDateTime(format(new Date(), 'HH:mm'));
     setNewPriority('medium');
     setNewCategory('personal');
     setNewNotes('');
     setNewRecurrence('none');
     setIsAddModalOpen(true);
  }

  const openEditModal = (reminder: Reminder) => {
     setEditingReminder(reminder);
     setNewTitle(reminder.title);
     setNewDateDate(new Date(reminder.dueDate));
     setNewDateTime(format(new Date(reminder.dueDate), 'HH:mm'));
     setNewPriority(reminder.priority);
     setNewCategory(reminder.category);
     setNewNotes(reminder.notes || '');
     setNewRecurrence(reminder.recurrence || 'none');
     setIsAddModalOpen(true);
  }

  const saveReminder = () => {
    if (!newTitle) return;
    const combinedDate = new Date(newDateDate);
    const [hours, minutes] = newDateTime.split(':').map(Number);
    combinedDate.setHours(hours || 0, minutes || 0);

    if (editingReminder) {
       setReminders(reminders.map(r => r.id === editingReminder.id ? {
          ...r,
          title: newTitle,
          dueDate: combinedDate,
          priority: newPriority,
          category: newCategory as any,
          notes: newNotes,
          recurrence: newRecurrence
       } : r));
    } else {
       const newReminder: Reminder = {
         id: Date.now().toString(),
         title: newTitle,
         dueDate: combinedDate,
         priority: newPriority,
         category: newCategory as any,
         completed: false,
         notes: newNotes,
         recurrence: newRecurrence
       };
       setReminders([...reminders, newReminder]);
    }
    setIsAddModalOpen(false);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] md:bg-white md:rounded-2xl md:shadow-sm md:border border-slate-200 overflow-hidden relative">
      
      {/* Left Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-40 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search reminders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            <div className="space-y-1">
               <button 
                onClick={() => { setActiveFilter('all'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' && !activeCategory ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Layers size={18} className={activeFilter === 'all' && !activeCategory ? 'text-blue-500' : 'text-slate-400'} />
                   <span>All Reminders</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('today'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'today' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Calendar size={18} className={activeFilter === 'today' ? 'text-blue-500' : 'text-slate-400'} />
                   <span>Today</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && isToday(r.dueDate)).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('scheduled'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'scheduled' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <CalendarIcon size={18} className={activeFilter === 'scheduled' ? 'text-red-500' : 'text-slate-400'} />
                   <span>Scheduled</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && isFuture(r.dueDate)).length}</span>
              </button>

              <button 
                onClick={() => { setActiveFilter('flagged'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'flagged' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <Flag size={18} className={activeFilter === 'flagged' ? 'text-orange-500' : 'text-slate-400'} />
                   <span>Flagged</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => !r.completed && r.priority === 'high').length}</span>
              </button>
              
               <button 
                onClick={() => { setActiveFilter('completed'); setActiveCategory(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'completed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                   <CheckCircle size={18} className={activeFilter === 'completed' ? 'text-emerald-500' : 'text-slate-400'} />
                   <span>Completed</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{reminders.filter(r => r.completed).length}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Lists</h3>
              </div>
              <div className="space-y-1">
                {lists.map((cat) => {
                  const Icon = cat.icon;
                  const count = reminders.filter(r => !r.completed && r.category === cat.id).length;
                  return (
                    <div key={cat.id} className="group relative">
                       <button 
                        onClick={() => { setActiveCategory(cat.id as any); setActiveFilter('all'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                           <Icon size={18} className={activeCategory === cat.id ? 'text-blue-500' : 'text-slate-400'} />
                           <span className="capitalize">{cat.label}</span>
                        </div>
                        {count > 0 && <span className="text-xs font-semibold text-slate-400 group-hover:hidden">{count}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="h-16 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <MoreVertical size={22} />
            </button>
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 capitalize truncate max-w-[120px] sm:max-w-none">
              {activeCategory || activeFilter}
            </h2>
            <span className="text-sm text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full hidden sm:block">
              {sortedReminders.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all active:scale-95 ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all active:scale-95 ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
          {sortedReminders.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-3 max-w-4xl mx-auto"
            }>
               {sortedReminders.map(reminder => (
                 <div 
                    key={reminder.id}
                    className={`
                      group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] md:active:scale-100
                      ${viewMode === 'grid' ? 'p-5 flex flex-col gap-4' : 'p-4 flex items-center gap-4'}
                    `}
                    onClick={() => toggleExpand(reminder.id)}
                 >
                    <div className={`flex items-start justify-between ${viewMode === 'list' ? 'w-auto' : 'w-full'}`}>
                       <div 
                         className={`cursor-pointer flex items-center justify-center ${viewMode === 'list' ? 'p-2 -m-2' : ''}`}
                         onClick={(e) => { e.stopPropagation(); toggleComplete(reminder.id); }}
                       >
                         <div className={`
                           w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                           ${reminder.completed 
                               ? 'bg-blue-500 border-blue-500' 
                               : 'border-slate-300 hover:border-blue-500 group-hover:border-blue-400 bg-white'
                           }
                         `}>
                            {reminder.completed && <CheckCircle size={16} className="text-white" />}
                         </div>
                       </div>
                       
                       {viewMode === 'grid' && reminder.priority === 'high' && (
                          <div className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                             <Flag size={10} fill="currentColor" />
                             <span>High</span>
                          </div>
                       )}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                       <h3 className={`font-medium text-base text-slate-900 truncate ${reminder.completed ? 'line-through text-slate-400' : ''}`}>
                          {reminder.title}
                       </h3>
                       
                       <div className={`flex items-center gap-4 mt-1.5 ${viewMode === 'grid' ? 'justify-between w-full' : ''}`}>
                          <div className={`flex items-center gap-1.5 text-xs ${isPast(reminder.dueDate) && !isToday(reminder.dueDate) && !reminder.completed ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                             <Calendar size={12} />
                             {getDateLabel(reminder.dueDate)}
                             {viewMode === 'list' && reminder.dueDate.getHours() > 0 && <span>• {format(reminder.dueDate, 'h:mm a')}</span>}
                          </div>
                          
                          <div className="flex items-center gap-3">
                             {reminder.recurrence && reminder.recurrence !== 'none' && (
                                <div className="text-xs text-slate-400 flex items-center gap-1" title={`Repeats ${reminder.recurrence}`}>
                                   <Repeat size={12} />
                                </div>
                             )}
                             {reminder.notes && (
                                <div className="text-xs text-slate-400 flex items-center gap-1" title="Has notes">
                                   <FileText size={12} />
                                </div>
                             )}
                             <div className="flex items-center gap-1.5 text-xs text-slate-400 capitalize">
                                <Tag size={12} />
                                {reminder.category}
                             </div>
                          </div>
                       </div>

                       {/* Expanded Notes View */}
                       {expandedReminderId === reminder.id && reminder.notes && (
                          <div className="mt-3 pl-3 py-2 border-l-2 border-slate-200 text-sm text-slate-600 animate-in slide-in-from-top-1 duration-200 fade-in">
                             <p className="whitespace-pre-wrap">{reminder.notes}</p>
                          </div>
                       )}
                    </div>

                    {viewMode === 'list' && (
                       <div className="flex items-center gap-1 sm:gap-3">
                          {reminder.priority === 'high' && (
                             <div className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Flag size={10} fill="currentColor" />
                                <span className="hidden md:inline">High</span>
                             </div>
                          )}
                          
                          {/* Expand chevron for visual cue */}
                          {reminder.notes && (
                             <button className="p-2 text-slate-300 hover:text-slate-500 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100">
                                {expandedReminderId === reminder.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                             </button>
                          )}

                          <button 
                             onClick={(e) => { e.stopPropagation(); openEditModal(reminder); }}
                             className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                             <Edit2 size={18} />
                          </button>

                          <button 
                             onClick={(e) => { e.stopPropagation(); initiateDelete(reminder.id); }}
                             className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    )}

                    {viewMode === 'grid' && (
                       <div className="flex items-center justify-end gap-1 w-full pt-3 border-t border-slate-50">
                          <button 
                             onClick={(e) => { e.stopPropagation(); openEditModal(reminder); }}
                             className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                             <Edit2 size={16} />
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); initiateDelete(reminder.id); }}
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    )}
                 </div>
               ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-4 text-slate-300">
                   <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No reminders found</h3>
                <p className="text-slate-500 mt-1 max-w-xs">You are all caught up! Create a new reminder to stay organized.</p>
             </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <h3 className="text-xl font-bold text-slate-900">{editingReminder ? 'Edit Reminder' : 'New Reminder'}</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reminder Title</label>
                     <input 
                        type="text" 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-50 text-xl md:text-2xl font-bold border-b-2 border-slate-100 px-0 py-2 focus:ring-0 focus:border-slate-900 placeholder-slate-300 outline-none bg-transparent text-slate-900 transition-colors" 
                        placeholder="What needs to be done?" 
                     />
                  </div>
                  
                  {/* Schedule Section */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                     <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-700">Schedule</h4>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                           <DatePicker 
                              selected={newDateDate}
                              onSelect={setNewDateDate}
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time</label>
                           <TimeSelect 
                              value={newDateTime}
                              onChange={setNewDateTime}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recurrence</label>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                           {['none', 'daily', 'weekly', 'monthly'].map((r) => (
                              <button
                                 key={r}
                                 onClick={() => setNewRecurrence(r as any)}
                                 className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${newRecurrence === r ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                              >
                                 {r}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                        <div className="flex gap-1">
                           {['low', 'medium', 'high'].map(p => (
                              <button 
                                 key={p}
                                 onClick={() => setNewPriority(p as any)}
                                 className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${newPriority === p ? getPriorityColor(p) + ' shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                              >
                                 {p}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">List</label>
                        <select 
                           value={newCategory} 
                           onChange={(e) => setNewCategory(e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none capitalize"
                        >
                           {lists.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Notes Section */}
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlignLeft size={12} /> Notes
                     </label>
                     <textarea 
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none placeholder-slate-400 text-slate-900 transition-all focus:bg-white"
                        rows={3}
                        placeholder="Add details, subtasks, or links..."
                     />
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-3xl">
                  <button 
                     onClick={saveReminder}
                     disabled={!newTitle}
                     className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-200 active:scale-95"
                  >
                     {editingReminder ? 'Save Changes' : 'Create Reminder'}
                  </button>
               </div>
            </div>
         </div>
      )}

      <ConfirmModal 
        isOpen={!!reminderToDelete}
        onClose={() => setReminderToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
      />
    </div>
  );
};

export default RemindersModule;