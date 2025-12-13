
import React, { useState, useMemo, useEffect } from 'react';
import {
   Moon,
   MapPin,
   ChevronRight,
   BookOpen,
   Heart,
   Book,
   FileText,
   Search,
   Volume2,
   PlayCircle,
   PauseCircle,
   Bookmark,
   Share2,
   PanelLeft,
   MoreVertical,
   Compass,
   ArrowLeft,
   Settings,
   Eye,
   EyeOff,
   Type,
   X,
   Info,
   Mic2,
   Globe,
   Home,
   Library,
   Layers,
   File,
   Sun,
   CloudSun,
   Shield,
   Coffee,
   Plane,
   Frown,
   Users,
   Copy,
   Check,
   RefreshCw,
   Vibrate,
   List,
   Grid,
   Maximize2,
   Play,
   Pause,
   SkipForward,
   SkipBack,
   Clock // Added Clock to imports
} from 'lucide-react';
import {
   MOCK_PRAYER_TIMES,
   MOCK_DUAS,
   MOCK_HADITH_COLLECTIONS,
   MOCK_FIQH,
   MOCK_QURAN_SURAHS,
   MOCK_QURAN_VERSES,
   MOCK_RECITERS
} from '../../constants';
import { IslamicService } from '../../services/api';
import { format } from 'date-fns';
import { QuranSurah, QuranVerse, FiqhTopic, HadithCollection, HadithVolume, HadithBook, HadithChapter } from '../../types';

type Tab = 'prayers' | 'quran' | 'dua' | 'hadith' | 'fiqh';

const IslamicModule: React.FC = () => {
   const [activeTab, setActiveTab] = useState<Tab>('prayers');
   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   // Dua States
   const [duaSearchQuery, setDuaSearchQuery] = useState('');
   const [selectedDuaCategory, setSelectedDuaCategory] = useState<string>('All');
   const [focusedDua, setFocusedDua] = useState<any | null>(null);
   const [tasbihCount, setTasbihCount] = useState(0);

   // Quran States
   const [quranSearchQuery, setQuranSearchQuery] = useState('');
   const [quranSidebarTab, setQuranSidebarTab] = useState<'surah' | 'juz'>('surah');

   // Hadith Navigation State
   const [selectedCollection, setSelectedCollection] = useState<HadithCollection | null>(null);
   const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
   const [hadithBookSearch, setHadithBookSearch] = useState('');

   // Fiqh State
   const [fiqhSearchQuery, setFiqhSearchQuery] = useState('');
   const [selectedFiqhTopic, setSelectedFiqhTopic] = useState<FiqhTopic | null>(null);

   // Quran Reader State
   const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
   const [quranSettingsOpen, setQuranSettingsOpen] = useState(false);
   const [quranViewOptions, setQuranViewOptions] = useState({
      showTranslation: true,
      showTransliteration: true,
      showDhivehi: false,
      showTafsir: true,
      fontSize: 36, // Arabic font size
      translationFontSize: 18, // English font size
      dhivehiFontSize: 18 // Dhivehi font size
   });
   const [selectedReciter, setSelectedReciter] = useState('mishary');
   const [activeTafsirVerse, setActiveTafsirVerse] = useState<QuranVerse | null>(null);

   // Audio State
   const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
   const [audioProgress, setAudioProgress] = useState(0);

   // New State for Real Data
   const [prayerTimes, setPrayerTimes] = useState<any>(null);
   const [prayerLogs, setPrayerLogs] = useState<any[]>([]);
   const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
   const [date, setDate] = useState(new Date()); // For prayer times

   // --- Effects & Helpers ---

   // Location and Prayer Times Fetching
   useEffect(() => {
      // Get Location
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (position) => {
               setLocationCoords({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
               });
            },
            (error) => {
               console.error("Location error", error);
               // Fallback to Mecca
               setLocationCoords({ lat: 21.4225, lng: 39.8262 });
            }
         );
      } else {
         setLocationCoords({ lat: 21.4225, lng: 39.8262 });
      }
   }, []);

   useEffect(() => {
      if (!locationCoords) return;
      const fetchData = async () => {
         try {
            const times = await IslamicService.getPrayerTimes(locationCoords, date);
            setPrayerTimes(times);
            const logs = await IslamicService.getLogs(date.toISOString().split('T')[0]);
            setPrayerLogs(logs);
         } catch (err) {
            console.error('Failed to fetch Islamic data', err);
         }
      };
      fetchData();
   }, [locationCoords, date]);

   // Tasbih Logic
   const handleTasbihClick = () => {
      setTasbihCount(prev => prev + 1);
      if (navigator.vibrate) {
         navigator.vibrate(50); // Haptic feedback
      }
   };

   const resetTasbih = () => {
      setTasbihCount(0);
      if (navigator.vibrate) navigator.vibrate(100);
   };

   // Audio Logic (Mock)
   const toggleAudio = (id: string) => {
      if (playingAudioId === id) {
         setPlayingAudioId(null);
      } else {
         setPlayingAudioId(id);
         setAudioProgress(0);
      }
   };

   useEffect(() => {
      let interval: any;
      if (playingAudioId) {
         interval = setInterval(() => {
            setAudioProgress(prev => {
               if (prev >= 100) {
                  setPlayingAudioId(null);
                  return 0;
               }
               return prev + 1;
            });
         }, 100);
      }
      return () => clearInterval(interval);
   }, [playingAudioId]);

   // Prayer Check Logic
   const handlePrayerCheck = async (prayerName: string) => {
      try {
         const status = 'completed'; // Toggle logic could be more complex
         await IslamicService.logPrayer({
            date: date.toISOString().split('T')[0],
            prayer: prayerName.toLowerCase(),
            status
         });
         // Update local state
         setPrayerLogs([...prayerLogs.filter((l: any) => l.prayer !== prayerName.toLowerCase()), { prayer: prayerName.toLowerCase(), prayed: true, onTime: true }]);
      } catch (err) {
         console.error(err);
      }
   };

   const navItems = [
      { id: 'prayers', label: 'Prayer Times', icon: Compass },
      { id: 'quran', label: 'Quran', icon: BookOpen },
      { id: 'hadith', label: 'Hadith', icon: Book },
      { id: 'dua', label: 'Dua & Azkar', icon: Heart },
      { id: 'fiqh', label: 'Fiqh & Books', icon: FileText },
   ];

   const getDuaCategoryIcon = (category: string) => {
      switch (category.toLowerCase()) {
         case 'morning & evening': return CloudSun;
         case 'prayer': return Compass;
         case 'protection': return Shield;
         case 'food & drink': return Coffee;
         case 'travel': return Plane;
         case 'emotion': return Frown;
         case 'home & family': return Users;
         case 'sleep': return Moon;
         case 'quranic': return BookOpen;
         default: return Heart;
      }
   };

   const handleSelectCollection = (collection: HadithCollection) => {
      setSelectedCollection(collection);
      setHadithBookSearch('');
      // Auto-select first book if available
      if (collection.volumes.length > 0 && collection.volumes[0].books.length > 0) {
         setSelectedBook(collection.volumes[0].books[0]);
      }
   };

   const getGradeColor = (grade: string) => {
      const g = grade.toLowerCase();
      if (g.includes('sahih')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (g.includes('hasan')) return 'bg-blue-100 text-blue-700 border-blue-200';
      if (g.includes('daif') || g.includes('weak')) return 'bg-orange-100 text-orange-700 border-orange-200';
      return 'bg-slate-100 text-slate-700 border-slate-200';
   };

   // --- Views ---

   const renderPrayersView = () => {
      const hijriDate = prayerTimes?.date.hijri.date || "14 Ramadan 1445";

      const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const isTodayFriday = date.getDay() === 5;

      const todaysPrayers = useMemo(() => {
         if (!prayerTimes) return MOCK_PRAYER_TIMES; // Fallback to mock if API not loaded

         const prayers = prayerNames.map(name => {
            let time = prayerTimes.timings[name];
            if (name === 'Dhuhr' && isTodayFriday) {
               time = prayerTimes.timings['Dhuhr']; // Jumuah time is often Dhuhr time
            }
            return { name, time };
         });

         // Add Jumuah if it's Friday and not already in the list
         if (isTodayFriday && !prayers.some(p => p.name === 'Jumuah')) {
            prayers.splice(prayers.findIndex(p => p.name === 'Dhuhr'), 0, { name: 'Jumuah', time: prayerTimes.timings['Dhuhr'] });
         }
         return prayers;
      }, [prayerTimes, isTodayFriday]);

      const nextPrayer = useMemo(() => {
         if (!prayerTimes) return null;
         const now = new Date();
         const currentHour = now.getHours();
         const currentMinute = now.getMinutes();

         for (const name of prayerNames) {
            const timeStr = prayerTimes.timings[name];
            if (!timeStr) continue;

            const [hourStr, minuteStr] = timeStr.split(':');
            const prayerHour = parseInt(hourStr);
            const prayerMinute = parseInt(minuteStr);

            if (prayerHour > currentHour || (prayerHour === currentHour && prayerMinute > currentMinute)) {
               return { name, time: timeStr };
            }
         }
         // If all prayers for today have passed, next prayer is Fajr of next day
         return { name: 'Fajr', time: prayerTimes.timings['Fajr'] };
      }, [prayerTimes, date]);

      // Helper to determine styling based on prayer type
      const getPrayerStyle = (name: string, isNext: boolean) => {
         if (name === 'Sunrise') {
            return 'bg-amber-100/10 border-amber-500/30 text-amber-200';
         }
         if (name === 'Tahajjud' || name === 'Duha') {
            return 'bg-emerald-900/30 border-emerald-500/30 text-emerald-200 border-dashed';
         }
         if (name === 'Jumuah') {
            return 'bg-emerald-400/20 border-emerald-400/50 text-white font-bold shadow-sm';
         }
         if (isNext) {
            return 'bg-white text-emerald-900 border-white shadow-lg';
         }
         return 'bg-black/10 border-white/5 text-emerald-50';
      };

      // Columns for the table (Generic view, Dhuhr implied)
      const tableColumns = prayerNames.filter(p => p !== 'Jumuah');

      return (
         <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-8">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Prayer Card */}
               <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div className="relative z-10 flex justify-between items-start mb-2">
                     <div>
                        <div className="flex items-center gap-2 mb-3 text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                           <MapPin size={14} />
                           <span className="text-xs font-semibold tracking-wide">{prayerTimes?.meta.timezone || 'New York, USA'}</span>
                        </div>
                        <div className="flex items-end gap-3">
                           <h2 className="text-4xl font-bold tracking-tight">{nextPrayer?.name || 'Loading...'}</h2>
                           <div className="flex items-center gap-1.5 text-emerald-100 pb-1.5 text-sm font-medium bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                              <Clock size={14} />
                              <span>{nextPrayer ? `at ${nextPrayer.time}` : 'Calculating...'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right hidden sm:block">
                        <div className="text-xl font-bold">{format(date, 'EEEE, MMM d')}</div>
                        <div className="text-emerald-200 text-base font-medium mt-0.5 opacity-90 font-amiri">{hijriDate}</div>
                     </div>
                  </div>

                  {/* Compact Grid Layout for Prayer Times */}
                  <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                     {todaysPrayers.map((prayer) => {
                        const isNext = nextPrayer?.name === prayer.name;
                        const isPrayed = prayerLogs.some((l: any) => l.prayer === prayer.name.toLowerCase() && l.prayed);
                        return (
                           <div key={prayer.name} className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${getPrayerStyle(prayer.name, isNext)}`}>
                              <div className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${isNext ? 'text-emerald-600' : 'text-emerald-200/70'}`}>
                                 {prayer.name}
                              </div>
                              <div className="text-lg font-bold leading-tight">{prayer.time}</div>
                              {isPrayed && (
                                 <div className="absolute bottom-2 right-2 text-emerald-300">
                                    <Check size={16} />
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Qibla Compass Card */}
               <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden min-h-[280px]">
                  <div className="absolute inset-0 bg-slate-50/50" />
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="w-40 h-40 rounded-full border-4 border-white flex items-center justify-center relative mb-6 bg-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                        <div className="absolute w-1.5 h-16 bg-rose-500 rounded-full top-3 origin-bottom rotate-45 transition-transform duration-700 shadow-sm" />
                        <div className="w-4 h-4 bg-slate-800 rounded-full z-10 border-2 border-white" />
                        <div className="absolute text-xs font-bold text-slate-400 top-2">N</div>
                        <div className="absolute text-xs font-bold text-emerald-600 bottom-2">Kaaba</div>
                        <div className="absolute inset-2 border-2 border-dashed border-slate-300 rounded-full opacity-50"></div>
                     </div>
                     <h3 className="text-xl font-bold text-slate-900">Qibla Direction</h3>
                     <p className="text-slate-500 font-medium">58° North East</p>
                  </div>
               </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
               <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Monthly Schedule</h3>
                  <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                     View Full Calendar <ChevronRight size={16} />
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                     <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                           <th className="p-5 pl-8 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Date</th>
                           {tableColumns.map(p => (
                              <th key={p} className={`p-5 ${p === 'Isha' ? 'pr-8' : ''} ${p === 'Sunrise' ? 'text-amber-500' : ''}`}>
                                 {p}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                           const rowDate = new Date();
                           rowDate.setDate(rowDate.getDate() + dayOffset);
                           const isRowFriday = rowDate.getDay() === 5;
                           const jumuahTime = prayerTimes?.timings['Dhuhr']; // Jumuah is usually Dhuhr time

                           return (
                              <tr key={dayOffset} className={`hover:bg-slate-50/50 transition-colors ${isRowFriday ? 'bg-emerald-50/20' : ''}`}>
                                 <td className="p-5 pl-8 text-sm font-semibold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-50">
                                    {format(rowDate, 'dd MMM')} <span className="text-slate-400 font-normal ml-1">{format(rowDate, 'EEE')}</span>
                                 </td>
                                 {tableColumns.map(pName => {
                                    // Handle Jumuah Swap for Dhuhr column on Fridays
                                    let displayTime = prayerTimes?.timings[pName] || 'N/A';
                                    let isJumuahCell = false;

                                    if (pName === 'Dhuhr' && isRowFriday) {
                                       displayTime = jumuahTime || displayTime;
                                       isJumuahCell = true;
                                    }

                                    return (
                                       <td key={pName} className={`p-5 text-sm font-medium ${pName === 'Sunrise' ? 'text-amber-600/70' : 'text-slate-600'}`}>
                                          {isJumuahCell ? (
                                             <div className="flex flex-col">
                                                <span className="font-bold text-emerald-600">{displayTime}</span>
                                                <span className="text-[9px] font-bold uppercase text-emerald-400">Jumuah</span>
                                             </div>
                                          ) : (
                                             displayTime
                                          )}
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
      );
   };

   const renderQuranView = () => {
      const filteredSurahs = MOCK_QURAN_SURAHS.filter(s =>
         s.englishName.toLowerCase().includes(quranSearchQuery.toLowerCase()) ||
         s.name.includes(quranSearchQuery)
      );

      const filteredVerses = selectedSurah
         ? MOCK_QURAN_VERSES.filter(v => v.surahNumber === selectedSurah.number)
         : [];

      return (
         <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
            {/* Navigation Sidebar */}
            <div className={`
          lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm
          ${selectedSurah ? 'hidden lg:flex' : 'flex w-full'}
        `}>
               {/* Sidebar Header & Tabs */}
               <div className="flex flex-col border-b border-slate-100 bg-slate-50/50">
                  <div className="p-4">
                     <div className="flex p-1 bg-slate-200/50 rounded-xl mb-4">
                        <button
                           onClick={() => setQuranSidebarTab('surah')}
                           className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${quranSidebarTab === 'surah' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           Surah
                        </button>
                        <button
                           onClick={() => setQuranSidebarTab('juz')}
                           className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${quranSidebarTab === 'juz' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           Juz
                        </button>
                     </div>

                     <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                           type="text"
                           placeholder={quranSidebarTab === 'surah' ? "Search Surah..." : "Search Juz..."}
                           value={quranSearchQuery}
                           onChange={(e) => setQuranSearchQuery(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-slate-400"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                  {quranSidebarTab === 'surah' ? (
                     // Surah List
                     filteredSurahs.length > 0 ? (
                        filteredSurahs.map((surah) => (
                           <button
                              key={surah.number}
                              onClick={() => setSelectedSurah(surah)}
                              className={`w-full text-left p-4 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-center justify-between group ${selectedSurah?.number === surah.number ? 'bg-emerald-50 border-emerald-100' : ''}`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${selectedSurah?.number === surah.number ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    {surah.number}
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-900 text-sm mb-0.5">{surah.englishName}</div>
                                    <div className="text-xs text-slate-500 font-medium">{surah.englishNameTranslation}</div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="font-amiri font-bold text-lg text-slate-800 leading-none mb-1">{surah.name}</div>
                                 <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{surah.numberOfAyahs} Ayahs</div>
                              </div>
                           </button>
                        ))
                     ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">No Surahs found.</div>
                     )
                  ) : (
                     // Juz List (Mock)
                     Array.from({ length: 30 }).map((_, i) => {
                        const juzNum = i + 1;
                        if (quranSearchQuery && !`Juz ${juzNum}`.toLowerCase().includes(quranSearchQuery.toLowerCase())) return null;
                        return (
                           <button
                              key={juzNum}
                              className="w-full text-left p-4 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-center gap-4 group"
                           >
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold group-hover:bg-white group-hover:shadow-sm transition-colors">
                                 {juzNum}
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900 text-sm">Juz {juzNum}</div>
                                 <div className="text-xs text-slate-500 font-medium">Part {juzNum}</div>
                              </div>
                           </button>
                        )
                     })
                  )}
               </div>
            </div>

            {/* Reader View */}
            <div className={`
          flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm relative
          ${selectedSurah ? 'flex' : 'hidden lg:flex'}
        `}>
               {selectedSurah ? (
                  <>
                     {/* Reader Header */}
                     <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/95 sticky top-0 z-20 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                           <button onClick={() => setSelectedSurah(null)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                              <ArrowLeft size={24} />
                           </button>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h2 className="text-xl md:text-2xl font-bold text-slate-900">{selectedSurah.englishName}</h2>
                                 <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{selectedSurah.revelationType}</span>
                              </div>
                              <p className="text-slate-500 text-xs font-medium mt-0.5">{selectedSurah.englishNameTranslation} • {selectedSurah.numberOfAyahs} Verses</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                           {/* Settings Toggle */}
                           <div className="relative">
                              <button
                                 onClick={() => setQuranSettingsOpen(!quranSettingsOpen)}
                                 className={`p-2.5 rounded-xl border transition-all ${quranSettingsOpen ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                              >
                                 <Settings size={20} />
                              </button>

                              {/* Settings Dropdown */}
                              {quranSettingsOpen && (
                                 <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-30 animate-in fade-in zoom-in-95 duration-200">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4">View Settings</h4>

                                    <div className="space-y-5">
                                       {/* Audio Settings */}
                                       <div className="space-y-3 pb-4 border-b border-slate-100">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mic2 size={12} /> Reciter</label>
                                          <select
                                             value={selectedReciter}
                                             onChange={(e) => setSelectedReciter(e.target.value)}
                                             className="w-full text-base md:text-sm border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
                                          >
                                             {MOCK_RECITERS.map(reciter => (
                                                <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                                             ))}
                                          </select>
                                       </div>

                                       {/* Toggles */}
                                       <div className="space-y-3 pb-4 border-b border-slate-100">
                                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display</label>

                                          <div className="flex items-center justify-between">
                                             <span className="text-sm text-slate-700">English Translation</span>
                                             <button onClick={() => setQuranViewOptions(p => ({ ...p, showTranslation: !p.showTranslation }))} className={`${quranViewOptions.showTranslation ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                {quranViewOptions.showTranslation ? <Eye size={18} /> : <EyeOff size={18} />}
                                             </button>
                                          </div>
                                          <div className="flex items-center justify-between">
                                             <span className="text-sm text-slate-700">Dhivehi Translation</span>
                                             <button onClick={() => setQuranViewOptions(p => ({ ...p, showDhivehi: !p.showDhivehi }))} className={`${quranViewOptions.showDhivehi ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                {quranViewOptions.showDhivehi ? <Eye size={18} /> : <EyeOff size={18} />}
                                             </button>
                                          </div>
                                          <div className="flex items-center justify-between">
                                             <span className="text-sm text-slate-700">Transliteration</span>
                                             <button onClick={() => setQuranViewOptions(p => ({ ...p, showTransliteration: !p.showTransliteration }))} className={`${quranViewOptions.showTransliteration ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                {quranViewOptions.showTransliteration ? <Eye size={18} /> : <EyeOff size={18} />}
                                             </button>
                                          </div>
                                       </div>

                                       {/* Font Sizes */}
                                       <div className="space-y-4">
                                          <div>
                                             <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-700 flex items-center gap-2"><Type size={14} /> Arabic Size</span>
                                                <span className="text-xs font-bold text-slate-400">{quranViewOptions.fontSize}px</span>
                                             </div>
                                             <input
                                                type="range"
                                                min="24"
                                                max="60"
                                                value={quranViewOptions.fontSize}
                                                onChange={(e) => setQuranViewOptions(p => ({ ...p, fontSize: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                             />
                                          </div>

                                          {quranViewOptions.showTranslation && (
                                             <div>
                                                <div className="flex items-center justify-between mb-2">
                                                   <span className="text-sm text-slate-700 flex items-center gap-2"><Type size={14} /> English Size</span>
                                                   <span className="text-xs font-bold text-slate-400">{quranViewOptions.translationFontSize}px</span>
                                                </div>
                                                <input
                                                   type="range"
                                                   min="12"
                                                   max="24"
                                                   value={quranViewOptions.translationFontSize}
                                                   onChange={(e) => setQuranViewOptions(p => ({ ...p, translationFontSize: parseInt(e.target.value) }))}
                                                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                                />
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto bg-slate-50/30 pb-20">
                        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
                           {/* Bismillah */}
                           {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                              <div className="text-center py-8">
                                 <p className="font-amiri text-3xl text-slate-800 leading-relaxed">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                              </div>
                           )}

                           {filteredVerses.length > 0 ? (
                              filteredVerses.map((verse) => (
                                 <div key={verse.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">

                                    {/* Verse Header / Actions */}
                                    <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-50">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-sans">
                                             {selectedSurah.number}:{verse.verseNumber}
                                          </div>
                                          <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button
                                                onClick={() => toggleAudio(verse.id)}
                                                className={`p-2 rounded-full transition-all ${playingAudioId === verse.id ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                                title="Play Audio"
                                             >
                                                {playingAudioId === verse.id ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                             </button>
                                             {quranViewOptions.showTafsir && (
                                                <button
                                                   onClick={() => setActiveTafsirVerse(verse)}
                                                   className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
                                                   title="View Tafsir"
                                                >
                                                   <BookOpen size={18} />
                                                </button>
                                             )}
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <button className="text-slate-300 hover:text-emerald-600 transition-colors"><Bookmark size={20} /></button>
                                          <button className="text-slate-300 hover:text-slate-600 transition-colors"><Share2 size={20} /></button>
                                       </div>
                                    </div>

                                    {/* Arabic Text */}
                                    <div className="text-right mb-8">
                                       <p
                                          className="font-amiri text-slate-900 leading-[2.5] tracking-wide"
                                          style={{ fontSize: `${quranViewOptions.fontSize}px` }}
                                          dir="rtl"
                                       >
                                          {verse.arabic}
                                       </p>
                                    </div>

                                    {/* Translations */}
                                    <div className="space-y-6">
                                       {quranViewOptions.showTransliteration && (
                                          <p className="text-base text-emerald-700 font-medium italic leading-relaxed">
                                             {verse.transliteration}
                                          </p>
                                       )}

                                       {quranViewOptions.showTranslation && (
                                          <p
                                             className="text-slate-700 leading-relaxed font-light border-l-2 border-slate-100 pl-4"
                                             style={{ fontSize: `${quranViewOptions.translationFontSize}px` }}
                                          >
                                             {verse.translation}
                                          </p>
                                       )}

                                       {quranViewOptions.showDhivehi && verse.dhivehi && (
                                          <p
                                             className="text-slate-800 leading-relaxed font-normal text-right font-amiri border-r-2 border-emerald-100 pr-4"
                                             style={{ fontSize: `${quranViewOptions.dhivehiFontSize}px` }}
                                             dir="rtl"
                                          >
                                             {verse.dhivehi}
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              ))
                           ) : (
                              <div className="flex flex-col items-center justify-center py-20 text-center">
                                 <BookOpen size={48} className="text-slate-200 mb-4" />
                                 <h3 className="text-lg font-bold text-slate-400">Verses not loaded</h3>
                                 <p className="text-slate-400 max-w-sm mt-2">Mock data for this Surah is not available. Please try Surah Al-Fatiha.</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Persistent Audio Player */}
                     {playingAudioId && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-30 animate-in slide-in-from-bottom-full duration-300">
                           <div className="max-w-3xl mx-auto flex items-center gap-4">
                              <button onClick={() => setPlayingAudioId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
                              <div className="flex-1">
                                 <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>{selectedSurah.englishName} {selectedSurah.number}:{playingAudioId}</span>
                                    <span>Mishary Rashid Alafasy</span>
                                 </div>
                                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-linear" style={{ width: `${audioProgress}%` }} />
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><SkipBack size={20} /></button>
                                 <button onClick={() => toggleAudio(playingAudioId)} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95">
                                    {audioProgress < 100 ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                 </button>
                                 <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><SkipForward size={20} /></button>
                              </div>
                           </div>
                        </div>
                     )}
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/30">
                     <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <BookOpen size={48} className="text-slate-300" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Read the Quran</h3>
                     <p className="text-slate-500 max-w-md">Select a Surah from the sidebar to begin reading. Use the settings to adjust text size and translations.</p>
                  </div>
               )}
            </div>

            {/* Tafsir Slide-Over */}
            {activeTafsirVerse && (
               <div className="absolute inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="w-full lg:w-[800px] md:w-[600px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
                     <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Tafsir Ibn Kathir</h3>
                           <p className="text-xs text-slate-500 font-medium">Surah {activeTafsirVerse.surahNumber}, Verse {activeTafsirVerse.verseNumber}</p>
                        </div>
                        <button onClick={() => setActiveTafsirVerse(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                           <X size={24} />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-slate-50/30">
                        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm mb-8">
                           <p className="font-amiri text-3xl text-right leading-loose mb-6">{activeTafsirVerse.arabic}</p>
                           <p className="text-base text-slate-600 italic border-l-4 border-emerald-500 pl-4 py-1 bg-slate-50/50 rounded-r-lg">{activeTafsirVerse.translation}</p>
                        </div>

                        <div className="prose prose-lg prose-slate max-w-none">
                           <h4 className="font-bold text-slate-900">Exegesis</h4>
                           <p className="text-slate-600 leading-loose">
                              This is a mock Tafsir entry for the selected verse. In a real application, this would fetch detailed scholarly commentary from sources like Ibn Kathir, Jalalayn, or Ma'arif ul Quran.
                           </p>
                           <p className="text-slate-600 leading-loose">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   };

   const renderHadithView = () => {
      // 1. Overview Mode: Grid of Collections
      if (!selectedCollection) {
         return (
            <div className="animate-fade-in space-y-6 max-w-6xl mx-auto">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 text-center">
                  <Book size={48} className="text-emerald-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900">Hadith Collections</h2>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">Browse the authentic sayings and traditions of the Prophet Muhammad (ﷺ).</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_HADITH_COLLECTIONS.map(collection => (
                     <div
                        key={collection.id}
                        onClick={() => handleSelectCollection(collection)}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group"
                     >
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                              <Book size={24} />
                           </div>
                           <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200">{collection.totalHadith.toLocaleString()} Hadiths</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{collection.name}</h3>
                        <p className="font-amiri text-lg text-slate-500 mb-4">{collection.arabicName}</p>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-4 border-t border-slate-50">
                           <Layers size={14} />
                           <span>{collection.volumes.length} Volumes</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         );
      }

      // 2. Reader Mode: Split Screen
      return (
         <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
            {/* Sidebar: Navigation & Books */}
            <div className="lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
               {/* Header */}
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <button
                     onClick={() => setSelectedCollection(null)}
                     className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
                  >
                     <ArrowLeft size={16} /> All Collections
                  </button>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{selectedCollection.name}</h3>
                  <p className="font-amiri text-slate-500 text-sm">{selectedCollection.arabicName}</p>
               </div>

               {/* Search Books */}
               <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input
                        type="text"
                        placeholder="Filter books..."
                        value={hadithBookSearch}
                        onChange={(e) => setHadithBookSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition-colors"
                     />
                  </div>
               </div>

               {/* Books List */}
               <div className="flex-1 overflow-y-auto">
                  {selectedCollection.volumes.map(vol => {
                     const filteredBooks = vol.books.filter(b => b.title.toLowerCase().includes(hadithBookSearch.toLowerCase()));
                     if (filteredBooks.length === 0) return null;

                     return (
                        <div key={vol.id}>
                           <div className="px-4 py-2 bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm border-y border-slate-100">
                              {vol.title}
                           </div>
                           {filteredBooks.map(book => (
                              <button
                                 key={book.id}
                                 onClick={() => setSelectedBook(book)}
                                 className={`w-full text-left p-3 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-start gap-3 group ${selectedBook?.id === book.id ? 'bg-emerald-50 border-emerald-100' : ''}`}
                              >
                                 <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[24px] text-center ${selectedBook?.id === book.id ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {book.number}
                                 </span>
                                 <span className={`text-sm font-medium leading-snug ${selectedBook?.id === book.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                                    {book.title}
                                 </span>
                              </button>
                           ))}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Main Content: Narrations */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm relative">
               {selectedBook ? (
                  <>
                     <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                           <Book size={14} />
                           <span>Book {selectedBook.number}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedBook.title}</h2>
                     </div>

                     <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 md:p-8 space-y-8">
                        {selectedBook.chapters.map(chapter => (
                           <div key={chapter.id} className="space-y-6">
                              {/* Chapter Header */}
                              <div className="flex items-start gap-4 pb-4 border-b border-slate-200/60">
                                 <div className="text-xl font-bold text-slate-300">#{chapter.number}</div>
                                 <div>
                                    <h3 className="text-lg font-bold text-slate-800">{chapter.title}</h3>
                                    {chapter.arabicTitle && <p className="font-amiri text-lg text-slate-500 mt-1">{chapter.arabicTitle}</p>}
                                 </div>
                              </div>

                              {/* Narrations */}
                              <div className="space-y-6">
                                 {chapter.narrations.map(hadith => (
                                    <div key={hadith.id} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                       {/* Meta Header */}
                                       <div className="flex justify-between items-center mb-6">
                                          <div className="flex items-center gap-2">
                                             <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                Hadith {hadith.number}
                                             </span>
                                             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(hadith.grade)}`}>
                                                {hadith.grade}
                                             </span>
                                          </div>
                                          <div className="flex gap-1">
                                             <button className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Copy">
                                                <Copy size={16} />
                                             </button>
                                             <button className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Bookmark">
                                                <Bookmark size={16} />
                                             </button>
                                          </div>
                                       </div>

                                       {/* Content */}
                                       {hadith.narrator && (
                                          <p className="font-semibold text-slate-900 mb-6 text-sm border-l-2 border-emerald-500 pl-3">
                                             {hadith.narrator}
                                          </p>
                                       )}

                                       <p className="font-amiri text-2xl md:text-3xl text-right leading-[2.2] text-slate-800 mb-8" dir="rtl">
                                          {hadith.arabic}
                                       </p>

                                       <div className="text-slate-700 leading-relaxed text-base md:text-lg font-light">
                                          {hadith.translation}
                                       </div>
                                    </div>
                                 ))}
                                 {chapter.narrations.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">
                                       No narrations available in this chapter mock.
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen size={32} className="text-slate-300" />
                     </div>
                     <p>Select a book from the sidebar to view Hadiths.</p>
                  </div>
               )}
            </div>
         </div>
      );
   };

   const renderDuaView = () => {
      // Categories
      const categories = ['All', 'Morning & Evening', 'Prayer', 'Food & Drink', 'Travel', 'Protection', 'Emotion', 'Home & Family', 'Sleep', 'Quranic'];

      // Filtered List
      const filteredDuas = MOCK_DUAS.filter(d => {
         const matchSearch = d.title.toLowerCase().includes(duaSearchQuery.toLowerCase()) || d.translation.toLowerCase().includes(duaSearchQuery.toLowerCase());
         const matchCategory = selectedDuaCategory === 'All' || d.category === selectedDuaCategory;
         return matchSearch && matchCategory;
      });

      return (
         <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
            {/* Sidebar: Categories */}
            <div className="lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-3 px-1">Categories</h3>
                  <div className="relative">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                        type="text"
                        placeholder="Search Dua..."
                        value={duaSearchQuery}
                        onChange={(e) => setDuaSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-slate-400 transition-shadow"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {categories.map(cat => {
                     const Icon = getDuaCategoryIcon(cat);
                     const isActive = selectedDuaCategory === cat;
                     const count = cat === 'All' ? MOCK_DUAS.length : MOCK_DUAS.filter(d => d.category === cat).length;

                     return (
                        <button
                           key={cat}
                           onClick={() => setSelectedDuaCategory(cat)}
                           className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                           <div className="flex items-center gap-3">
                              <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                              <span>{cat}</span>
                           </div>
                           <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                        </button>
                     )
                  })}
               </div>
            </div>

            {/* Main Content: Dua Grid */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 rounded-2xl border border-slate-200/50">
               <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDuas.map(dua => (
                     <div
                        key={dua.id}
                        onClick={() => { setFocusedDua(dua); resetTasbih(); }}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col h-full"
                     >
                        <div className="flex items-start justify-between mb-4">
                           <h3 className="font-bold text-slate-900 line-clamp-1">{dua.title}</h3>
                           <button className={`text-slate-300 hover:text-amber-400 transition-colors ${dua.isFavorite ? 'text-amber-400' : ''}`} onClick={(e) => e.stopPropagation()}>
                              <Heart size={18} fill={dua.isFavorite ? "currentColor" : "none"} />
                           </button>
                        </div>
                        <p className="font-amiri text-xl text-right text-slate-800 leading-loose mb-4 line-clamp-2" dir="rtl">{dua.arabic}</p>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{dua.translation}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                           <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{dua.category}</span>
                           <span className="text-xs text-slate-400">{dua.reference}</span>
                        </div>
                     </div>
                  ))}
                  {filteredDuas.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
                        <Search size={48} className="mb-4 text-slate-200" />
                        <p>No Duas found matching your criteria.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Focus Modal */}
            {focusedDua && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                     {/* Modal Header */}
                     <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white shrink-0">
                        <div>
                           <h3 className="text-xl font-bold text-slate-900">{focusedDua.title}</h3>
                           <p className="text-sm text-slate-500">{focusedDua.category} • {focusedDua.reference}</p>
                        </div>
                        <button onClick={() => setFocusedDua(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                           <X size={24} />
                        </button>
                     </div>

                     {/* Modal Body */}
                     <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                        <div className="text-center space-y-8">
                           <p className="font-amiri text-3xl md:text-4xl text-slate-900 leading-[2.5]" dir="rtl">
                              {focusedDua.arabic}
                           </p>
                           <div className="space-y-4">
                              <p className="text-lg text-emerald-700 italic font-medium">{focusedDua.transliteration}</p>
                              <p className="text-slate-700 leading-relaxed max-w-lg mx-auto">{focusedDua.translation}</p>
                           </div>
                        </div>
                     </div>

                     {/* Tasbih Footer */}
                     <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-center justify-between gap-6">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Count</span>
                              <span className="text-4xl font-bold text-slate-900 font-mono">{tasbihCount}</span>
                           </div>

                           <button
                              onClick={handleTasbihClick}
                              className="flex-1 h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                           >
                              <Vibrate size={24} />
                              Tap to Count
                           </button>

                           <button
                              onClick={resetTasbih}
                              className="p-4 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors"
                              title="Reset Counter"
                           >
                              <RefreshCw size={24} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   };

   const renderFiqhView = () => {
      // Categories for sidebar
      const categories = ['Purification', 'Worship', 'Business', 'Family', 'Ethics'];

      // Topics List
      const topics = MOCK_FIQH.filter(t =>
         t.title.toLowerCase().includes(fiqhSearchQuery.toLowerCase()) ||
         t.content.toLowerCase().includes(fiqhSearchQuery.toLowerCase())
      );

      return (
         <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in relative">
            {/* Sidebar: Topics */}
            <div className="lg:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-3 px-1">Fiqh Topics</h3>
                  <div className="relative">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                        type="text"
                        placeholder="Search topics..."
                        value={fiqhSearchQuery}
                        onChange={(e) => setFiqhSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white placeholder-slate-400"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                  {categories.map(cat => {
                     const catTopics = topics.filter(t => t.category === cat);
                     if (catTopics.length === 0) return null;

                     return (
                        <div key={cat}>
                           <div className="px-4 py-2 bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm border-y border-slate-100">
                              {cat}
                           </div>
                           {catTopics.map(topic => (
                              <button
                                 key={topic.id}
                                 onClick={() => setSelectedFiqhTopic(topic)}
                                 className={`w-full text-left p-3 hover:bg-slate-50 transition-all border-b border-slate-50 flex items-start gap-3 group ${selectedFiqhTopic?.id === topic.id ? 'bg-emerald-50 border-emerald-100' : ''}`}
                              >
                                 <div className={`mt-0.5 p-1.5 rounded-md ${selectedFiqhTopic?.id === topic.id ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                                    <FileText size={14} />
                                 </div>
                                 <span className={`text-sm font-medium leading-snug line-clamp-2 ${selectedFiqhTopic?.id === topic.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                                    {topic.title}
                                 </span>
                              </button>
                           ))}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Reading Pane */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm relative">
               {selectedFiqhTopic ? (
                  <>
                     <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                              {selectedFiqhTopic.category}
                           </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedFiqhTopic.title}</h1>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
                        <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose">
                           {/* Rendering simple text with line breaks for mock */}
                           {selectedFiqhTopic.content.split('\n').map((paragraph, i) => (
                              <p key={i} className="mb-4">{paragraph}</p>
                           ))}
                        </div>
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/30">
                     <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <Library size={48} className="text-slate-300" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Knowledge Base</h3>
                     <p className="text-slate-500 max-w-md">Select a topic from the sidebar to start reading about Fiqh and Islamic knowledge.</p>
                  </div>
               )}
            </div>
         </div>
      );
   };

   return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
         {/* Sidebar */}
         <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
            <div className="w-64 h-full flex flex-col">
               <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <Moon className="text-emerald-600" size={24} />
                     Islamic
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Spirituality & Knowledge</p>
               </div>
               <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navItems.map(item => (
                     <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id as Tab); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                     >
                        <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'} />
                        {item.label}
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
               <div className="flex items-center gap-3">
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"><MoreVertical size={20} /></button>
                  <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><PanelLeft size={20} /></button>
                  <h2 className="text-xl font-bold text-slate-900 capitalize">{navItems.find(n => n.id === activeTab)?.label}</h2>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 md:p-8">
               {activeTab === 'prayers' && renderPrayersView()}
               {activeTab === 'quran' && renderQuranView()}
               {activeTab === 'hadith' && renderHadithView()}
               {activeTab === 'dua' && renderDuaView()}
               {activeTab === 'fiqh' && renderFiqhView()}
            </div>
         </div>
      </div>
   );
};

export default IslamicModule;
