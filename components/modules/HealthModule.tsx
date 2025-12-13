
import React, { useState, useMemo, useEffect } from 'react';
import {
   Activity,
   Footprints,
   Moon,
   Weight,
   Droplets,
   Plus,
   TrendingUp,
   Clock,
   Heart,
   Dumbbell,
   PanelLeft,
   MoreVertical,
   Calendar,
   X,
   ChevronRight,
   ChevronLeft
} from 'lucide-react';
import { HealthService } from '../../services/api';
import { HealthLog } from '../../types';
import { format, addDays } from 'date-fns';
import DatePicker from '../ui/DatePicker';
import TimeSelect from '../ui/TimeSelect';
import { useConfig } from '../../context/ConfigContext';

type MetricType = string;
type TimeRange = 'daily' | 'weekly' | 'monthly';

const HealthModule: React.FC = () => {
   const [activeMetric, setActiveMetric] = useState<MetricType>('weight');
   const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
   const [history, setHistory] = useState<HealthLog[]>([]);
   const [loading, setLoading] = useState(true);

   // Consume Config for Metrics
   const { metrics } = useConfig();

   // Ensure activeMetric is valid
   useEffect(() => {
      if (metrics.length > 0 && !metrics.find(m => m.id === activeMetric)) {
         setActiveMetric(metrics[0].id);
      }
   }, [metrics]);

   // Fetch Health Logs
   useEffect(() => {
      const fetchLogs = async () => {
         try {
            setLoading(true);
            const data = await HealthService.getLogs();
            // Parse dates
            const parsed = data.map((d: any) => ({
               ...d,
               date: new Date(d.date)
            }));
            setHistory(parsed);
         } catch (err) {
            console.error('Failed to fetch health logs', err);
         } finally {
            setLoading(false);
         }
      };
      fetchLogs();
   }, []);

   // Pagination State
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   // Layout State
   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);

   // Add Entry Form State
   const [newValue, setNewValue] = useState('');
   const [newDateDate, setNewDateDate] = useState<Date>(new Date());
   const [newDateTime, setNewDateTime] = useState<string>(format(new Date(), 'HH:mm'));
   const [newNote, setNewNote] = useState('');

   // Helper to get color classes from config color string
   const getColorClasses = (color: string) => {
      return {
         bg: `bg-${color}-50`,
         text: `text-${color}-600`,
         border: `border-${color}-100`
      };
   };

   // Reset pagination when metric changes
   useEffect(() => {
      setCurrentPage(1);
   }, [activeMetric]);

   // Filter Data for Chart
   const chartData = useMemo(() => {
      const data = history.filter(h => h.type === activeMetric);
      // Sort by date ascending
      return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
   }, [history, activeMetric]);

   // Filter Data for List (Recent first)
   const recentLogs = useMemo(() => {
      return [...chartData].reverse();
   }, [chartData]);

   // Pagination Logic
   const totalPages = Math.ceil(recentLogs.length / itemsPerPage);
   const currentLogs = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return recentLogs.slice(startIndex, startIndex + itemsPerPage);
   }, [recentLogs, currentPage]);

   // Handle Add Entry
   const handleAddEntry = async () => {
      if (!newValue) return;

      // Combine Date and Time
      const combinedDate = new Date(newDateDate);
      const [hours, minutes] = newDateTime.split(':').map(Number);
      combinedDate.setHours(hours || 0, minutes || 0);

      const entryData = {
         type: activeMetric as any,
         value: Number(newValue),
         date: combinedDate,
         note: newNote
      };

      // Optimistic Update (using temp ID)
      const tempEntry: HealthLog = { id: Date.now().toString(), ...entryData };
      setHistory([tempEntry, ...history]);

      setIsAddModalOpen(false);
      setNewValue('');
      setNewNote('');
      setCurrentPage(1); // Reset pagination

      try {
         const saved = await HealthService.logEntry(entryData);
         // Replace temp with real
         setHistory(prev => [
            { ...saved, date: new Date(saved.date) },
            ...prev.filter(p => p.id !== tempEntry.id)
         ]);
      } catch (err) {
         console.error(err);
         // Revert
         setHistory(prev => prev.filter(p => p.id !== tempEntry.id));
      }
   };

   // Get Current/Latest Value
   const getLatestValue = (type: string) => {
      const latest = history.filter(h => h.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return latest ? latest.value : '-';
   };

   // SVG Chart Component
   const TrendChart = ({ data, range }: { data: HealthLog[], range: TimeRange }) => {
      if (data.length < 2) return <div className="h-64 flex items-center justify-center text-slate-400">Not enough data to display chart</div>;

      // Determine data window based on range
      let displayData = [...data];
      const today = new Date();
      if (range === 'daily') displayData = displayData.slice(-7); // Last 7 entries
      if (range === 'weekly') displayData = displayData.filter(d => d.date >= addDays(today, -30)); // Last 30 days
      // Monthly shows all

      if (displayData.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No data for this period</div>;

      const values = displayData.map(d => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.1 || 1; // Add padding to Y axis

      const width = 800;
      const height = 300;

      // Calculate points
      const points = displayData.map((d, i) => {
         const x = (i / (displayData.length - 1)) * width;
         const y = height - ((d.value - (min - padding)) / ((max + padding) - (min - padding))) * height;
         return `${x},${y}`;
      }).join(' ');

      const currentMetric = metrics.find(m => m.id === activeMetric);
      const colors = getColorClasses(currentMetric?.color || 'blue');

      return (
         <div className="w-full h-64 sm:h-80 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
               {/* Grid Lines */}
               <line x1="0" y1="0" x2={width} y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
               <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
               <line x1="0" y1={height} x2={width} y2={height} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

               {/* Gradient Fill */}
               <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                     <stop offset="0%" stopColor="currentColor" className={`${colors.text.replace('text-', 'text-opacity-20 ')}`} />
                     <stop offset="100%" stopColor="currentColor" className={`${colors.text.replace('text-', 'text-opacity-0 ')}`} />
                  </linearGradient>
               </defs>
               <path
                  d={`M0,${height} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L${width},${height} Z`}
                  fill="url(#gradient)"
                  className={colors.text}
                  style={{ opacity: 0.2 }}
               />

               {/* Line */}
               <polyline
                  points={points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={colors.text}
               />

               {/* Data Points */}
               {displayData.map((d, i) => {
                  const x = (i / (displayData.length - 1)) * width;
                  const y = height - ((d.value - (min - padding)) / ((max + padding) - (min - padding))) * height;
                  return (
                     <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        className="fill-white stroke-current stroke-2 group hover:scale-150 transition-transform origin-center"
                        style={{ color: 'inherit' }} // Inherits from parent wrapper usually, handled by class below
                     >
                        <title>{`${d.value} ${currentMetric?.unit} • ${format(new Date(d.date), 'MMM d')}`}</title>
                     </circle>
                  );
               })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
               <span>{format(new Date(displayData[0].date), 'MMM d')}</span>
               <span>{format(new Date(displayData[displayData.length - 1].date), 'MMM d')}</span>
            </div>
         </div>
      );
   };

   const currentMetric = metrics.find(m => m.id === activeMetric);
   if (!currentMetric) return null; // Should ideally show a loading or error state

   const activeColors = getColorClasses(currentMetric.color);

   return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

         {/* Sidebar */}
         <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-80 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-72 lg:w-80' : 'md:w-0 md:border-r-0'}
      `}>
            {/* Inner wrapper */}
            <div className="w-72 lg:w-80 h-full flex flex-col">
               <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <Activity className="text-blue-600" />
                     Health Metrics
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Track your vitals & progress</p>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {metrics.filter(m => m.active).map((metric) => {
                     const isActive = activeMetric === metric.id;
                     const Icon = metric.icon;
                     const latest = getLatestValue(metric.id);
                     const mColors = getColorClasses(metric.color);

                     return (
                        <button
                           key={metric.id}
                           onClick={() => { setActiveMetric(metric.id as MetricType); setMobileMenuOpen(false); }}
                           className={`
                    w-full text-left p-4 rounded-xl border transition-all duration-200 group
                    ${isActive
                                 ? 'bg-white border-slate-200 shadow-md ring-1 ring-slate-100'
                                 : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-100/50'
                              }
                  `}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg transition-colors ${isActive ? mColors.bg + ' ' + mColors.text : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                                    <Icon size={18} />
                                 </div>
                                 <span className={`font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{metric.label}</span>
                              </div>
                           </div>
                           <div className="flex items-end justify-between">
                              <div>
                                 <span className="text-2xl font-bold text-slate-900">{latest}</span>
                                 <span className="text-xs text-slate-500 font-medium ml-1">{metric.unit}</span>
                              </div>
                              <ChevronRight size={16} className={`text-slate-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                           </div>
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  {/* Mobile Toggle */}
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                     <MoreVertical size={20} />
                  </button>

                  {/* Desktop Toggle */}
                  <button
                     onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                     className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                     title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                  >
                     <PanelLeft size={20} />
                  </button>

                  <h2 className="text-xl font-bold text-slate-900">{currentMetric.label}</h2>
               </div>

               <div className="flex items-center gap-3">
                  <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg">
                     {['daily', 'weekly', 'monthly'].map((r) => (
                        <button
                           key={r}
                           onClick={() => setTimeRange(r as TimeRange)}
                           className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${timeRange === r ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           {r}
                        </button>
                     ))}
                  </div>
                  <button
                     onClick={() => setIsAddModalOpen(true)}
                     className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
                  >
                     <Plus size={18} />
                     <span className="hidden sm:inline">Add Entry</span>
                  </button>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
               <div className="p-6 max-w-5xl mx-auto space-y-8">

                  {/* Chart Section */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Trends</h3>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600`}>
                           <TrendingUp size={14} />
                           <span>On Track</span>
                        </div>
                     </div>
                     <div className={activeColors.text}>
                        <TrendChart data={chartData} range={timeRange} />
                     </div>
                  </div>

                  {/* History List */}
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 mb-4">History</h3>
                     <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                        {currentLogs.length > 0 ? (
                           <div className="divide-y divide-slate-50">
                              {currentLogs.map((log) => (
                                 <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                       <div className={`p-2 rounded-lg ${activeColors.bg} ${activeColors.text}`}>
                                          {React.createElement(currentMetric.icon, { size: 20 })}
                                       </div>
                                       <div>
                                          <div className="font-bold text-slate-900 text-lg">
                                             {log.value} <span className="text-sm text-slate-500 font-medium">{currentMetric.unit}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                             <Calendar size={12} />
                                             {format(new Date(log.date), 'MMM d, yyyy')}
                                             <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                             <Clock size={12} />
                                             {format(new Date(log.date), 'h:mm a')}
                                          </div>
                                       </div>
                                    </div>
                                    {log.note && (
                                       <div className="hidden sm:block text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 max-w-xs truncate">
                                          {log.note}
                                       </div>
                                    )}
                                 </div>
                              ))}

                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                 <div className="p-4 flex items-center justify-between bg-slate-50/50">
                                    <button
                                       onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                       disabled={currentPage === 1}
                                       className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                       <ChevronLeft size={16} /> Previous
                                    </button>
                                    <span className="text-sm font-medium text-slate-500">
                                       Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                       onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                       disabled={currentPage === totalPages}
                                       className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                       Next <ChevronRight size={16} />
                                    </button>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div className="p-12 text-center text-slate-400">
                              No history found. Add your first entry!
                           </div>
                        )}
                     </div>
                  </div>

               </div>
            </div>

         </div>

         {/* Add Entry Modal */}
         {isAddModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
               <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${activeColors.bg} ${activeColors.text}`}>
                           {React.createElement(currentMetric.icon, { size: 20 })}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Log Data</h3>
                           <p className="text-xs text-slate-500 font-medium">Add {currentMetric.label} entry</p>
                        </div>
                     </div>
                     <button onClick={() => setIsAddModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                        <X size={24} />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                           Value ({currentMetric.unit})
                        </label>
                        <input
                           type="number"
                           autoFocus
                           value={newValue}
                           onChange={(e) => setNewValue(e.target.value)}
                           className="w-full bg-slate-50 text-3xl font-bold border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none placeholder-slate-300 text-slate-900"
                           placeholder="0"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                           <DatePicker
                              selected={newDateDate}
                              onSelect={setNewDateDate}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time</label>
                           <TimeSelect
                              value={newDateTime}
                              onChange={setNewDateTime}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Note (Optional)</label>
                        <textarea
                           value={newNote}
                           onChange={(e) => setNewNote(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base md:text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none placeholder-slate-400 text-slate-900"
                           rows={3}
                           placeholder="How are you feeling?"
                        />
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-3xl">
                     <button
                        onClick={handleAddEntry}
                        disabled={!newValue}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-200 active:scale-[0.98]"
                     >
                        Save Entry
                     </button>
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default HealthModule;
