import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  MoreHorizontal,
  X,
  AlignLeft,
  Tag,
  Moon,
  Columns,
  LayoutGrid,
  List,
  Trash2
} from 'lucide-react';
import {
  format,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  isToday,
  addWeeks,
  addDays
} from 'date-fns';
import { CalendarEvent, Reminder, Habit } from '../../types';
import { CalendarService, RemindersService, HabitsService } from '../../services/api';
import DatePicker from '../ui/DatePicker';
import TimeSelect from '../ui/TimeSelect';

type ViewMode = 'month' | 'week' | 'day';

const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Data State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evData, remData, habData] = await Promise.all([
          CalendarService.getEvents(),
          RemindersService.getAll(),
          HabitsService.getAll()
        ]);
        setEvents(evData.map((e: any) => ({ ...e, date: new Date(e.date) })));
        // Convert reminder dueDate strings to Date objects
        setReminders(remData.map((r: any) => ({ ...r, dueDate: new Date(r.dueDate) })));
        setHabits(habData);
      } catch (err) {
        console.error('Failed to fetch calendar data', err);
      }
    };
    fetchData();
  }, []);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<'work' | 'personal' | 'health' | 'islamic'>('work');
  const [newEventDate, setNewEventDate] = useState<Date>(new Date());
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDescription, setNewEventDescription] = useState(''); // Added
  const [newEventColor, setNewEventColor] = useState(''); // Added

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper functions to replace missing date-fns exports
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Hijri Date Formatter
  const formatHijri = (date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) => {
    try {
      return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', options).format(date);
    } catch (e) {
      return '';
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle) return;

    // Combine date & time
    const combinedDate = new Date(newEventDate);
    const [hours, minutes] = newEventStartTime.split(':').map(Number); // Changed from newEventTime to newEventStartTime
    combinedDate.setHours(hours || 0, minutes || 0);

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: combinedDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      category: newEventCategory as 'work' | 'personal' | 'family' | 'islamic', // Changed 'personal' to 'family' as per diff
      location: newEventLocation,
      description: newEventDescription,
      color: newEventColor
    };

    // Optimistic Update
    setEvents([...events, newEvent]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewEventTitle('');
    setNewEventLocation('');
    setNewEventDescription('');
    setNewEventColor(''); // Added reset for newEventColor

    try {
      const saved = await CalendarService.create({
        ...newEvent,
        // Extract specific fields if needed by backend
      });
      // Update with real ID
      setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...saved, date: new Date(saved.date) } : e));
    } catch (err) {
      console.error(err);
      // Revert
      setEvents(prev => prev.filter(e => e.id !== newEvent.id));
    }
  };

  const openAddModal = () => {
    setNewEventDate(selectedDate);
    setIsAddModalOpen(true);
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    const prevEvents = [...events];
    setEvents(events.filter(e => e.id !== eventId));
    try {
      await CalendarService.delete(eventId);
    } catch (err) {
      console.error('Failed to delete event', err);
      setEvents(prevEvents);
    }
  };

  // Filter events
  const selectedDayEvents = events.filter(event =>
    isSameDay(event.date, selectedDate)
  );

  // Filter reminders for the selected date
  const selectedDayReminders = reminders.filter(reminder =>
    isSameDay(new Date(reminder.dueDate), selectedDate)
  );

  // Filter habits for the selected date
  const selectedDayHabits = habits.filter(habit => {
    // Simplifying habit logic for calendar view
    return habit.frequency === 'daily' || (habit.frequency === 'custom' && habit.target);
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'personal': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'health': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'islamic': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getEventStyle = (event: CalendarEvent) => {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = event.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = endMinutes - startMinutes;

    // 64px per hour = ~1.06px per minute
    const top = (startMinutes / 60) * 64;
    const height = (duration / 60) * 64;

    return {
      top: `${top}px`,
      height: `${height}px`
    };
  };

  // --- RENDERERS ---

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = getStartOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="flex-1 flex flex-col h-full min-h-0 bg-white">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map(day => (
            <div key={day} className="py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const dayEvents = events.filter(e => isSameDay(e.date, day));

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative border-b border-r border-slate-100 p-1 sm:p-2 cursor-pointer transition-colors group h-full flex flex-col
                  ${!isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'}
                  ${isSelected ? 'bg-brand-50/20' : 'hover:bg-slate-100'}
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all
                    ${isDayToday
                      ? 'bg-brand-600 text-white shadow-md'
                      : isSelected
                        ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                        : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700 group-hover:bg-slate-200'
                    }
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event Indicators */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className="hidden lg:block">
                      <div className={`
                        text-[10px] truncate px-1.5 py-0.5 rounded border font-medium
                        ${getCategoryColor(event.category)}
                      `}>
                        {event.title}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="hidden lg:block text-[10px] text-slate-400 pl-1 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                  {/* Mobile Dot Indicator */}
                  <div className="flex lg:hidden gap-1 mt-1 justify-center flex-wrap px-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${event.category === 'work' ? 'bg-blue-400' :
                        event.category === 'personal' ? 'bg-purple-400' :
                          event.category === 'health' ? 'bg-emerald-400' : 'bg-teal-400'
                        }`} />
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 ring-2 ring-inset ring-brand-500/20 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeGridView = () => {
    const start = viewMode === 'week' ? getStartOfWeek(currentDate) : startOfDay(currentDate);
    const daysToShow = viewMode === 'week'
      ? eachDayOfInterval({ start, end: addDays(start, 6) })
      : [start];

    return (
      <div className="flex-1 flex flex-col h-full min-h-0 bg-white overflow-hidden">
        {/* Grid Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-y-scroll scrollbar-hide">
          <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50" /> {/* Time column header placeholder */}
          {daysToShow.map(day => {
            const isDayToday = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                      flex-1 py-3 text-center border-r border-slate-200 cursor-pointer transition-colors
                      ${isSelected ? 'bg-brand-50/30' : 'hover:bg-slate-100'}
                    `}
              >
                <div className={`text-xs font-semibold uppercase mb-1 ${isDayToday ? 'text-brand-600' : 'text-slate-500'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold
                        ${isDayToday ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-900'}
                     `}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto relative bg-white">
          <div className="flex min-h-[1536px]"> {/* 24h * 64px */}

            {/* Time Labels Column */}
            <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10">
              {hours.map(hour => (
                <div key={hour} className="h-16 relative">
                  <span className="absolute -top-3 right-2 text-xs text-slate-400 font-medium bg-white px-1">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {daysToShow.map(day => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-1 relative border-r border-slate-100 ${isSelected ? 'bg-brand-50/10' : ''}`}
                >
                  {/* Horizontal Hour Lines */}
                  {hours.map(hour => (
                    <div key={hour} className="h-16 border-b border-slate-100" />
                  ))}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const style = getEventStyle(event);
                    const colorClass = getCategoryColor(event.category);

                    return (
                      <div
                        key={event.id}
                        className={`
                                    absolute inset-x-1 p-2 rounded-lg border text-xs overflow-hidden cursor-pointer hover:shadow-md hover:z-20 transition-all opacity-90 hover:opacity-100
                                    ${colorClass}
                                  `}
                        style={style}
                        onClick={(e) => { e.stopPropagation(); /* Handle Edit */ }}
                      >
                        <div className="font-bold truncate">{event.title}</div>
                        <div className="opacity-80 truncate">{event.startTime} - {event.endTime}</div>
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 opacity-70">
                            <MapPin size={10} />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Current Time Indicator (Only if today) */}
                  {isToday(day) && (
                    <div
                      className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                      style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 60 * 64}px` }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-6rem)] overflow-hidden">
      {/* Main Calendar Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-slate-900 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-slate-900 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-none">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1.5 text-emerald-600 mt-1">
                <Moon size={12} className="fill-current" />
                <span className="text-xs font-medium font-amiri">
                  {formatHijri(currentDate, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Toggles */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Day
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={jumpToToday}
                className="px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs active:scale-95 hidden sm:block"
              >
                Today
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm active:scale-95"
                title="Add Event"
              >
                <Plus size={18} />
                <span className="hidden sm:inline ml-2">Add Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View Content */}
        {viewMode === 'month' ? renderMonthView() : renderTimeGridView()}

      </div>

      {/* Side Panel (Contextual) */}
      <div className="hidden xl:flex w-80 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900">
              {format(selectedDate, 'EEEE')}
            </h3>
            <button className="text-slate-400 hover:text-slate-600 p-2">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex flex-col">
            <p className="text-slate-500 font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
            <p className="text-emerald-600 font-medium font-amiri text-sm mt-0.5 flex items-center gap-2">
              <Moon size={12} className="fill-current" />
              {formatHijri(selectedDate)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Events Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</h4>
            </div>

            <div className="space-y-3">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map(event => (
                  <div key={event.id} className="relative pl-4 py-1 group">
                    <div className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full ${event.category === 'work' ? 'bg-blue-500' :
                      event.category === 'personal' ? 'bg-purple-500' :
                        event.category === 'health' ? 'bg-emerald-500' : 'bg-teal-500'
                      }`} />
                    <div className="bg-slate-50 group-hover:bg-white p-3 rounded-xl border border-transparent group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <h5 className="text-sm font-semibold text-slate-900">{event.title}</h5>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarIcon size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No events scheduled</p>
                </div>
              )}
            </div>
          </section>

          {/* Tasks/Reminders Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders</h4>
              <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors active:bg-brand-100">
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {selectedDayReminders.length > 0 ? (
                selectedDayReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-brand-200 transition-colors">
                    <div className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center ${reminder.completed ? 'bg-brand-600 border-brand-600' : 'border-slate-300 hover:border-brand-500'
                      }`}>
                      {reminder.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {reminder.title}
                    </span>
                    <span className="ml-auto text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {reminder.dueDate instanceof Date ? format(reminder.dueDate, 'h:mm a') : '--:--'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic pl-1">No reminders for this day</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">New Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title</label>
                <input
                  type="text"
                  autoFocus
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full text-xl font-bold border-b border-slate-200 px-0 py-2 focus:ring-0 focus:border-brand-600 placeholder-slate-300 outline-none bg-transparent text-slate-900 transition-colors"
                  placeholder="e.g., Team Meeting"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                  <DatePicker
                    selected={newEventDate}
                    onSelect={setNewEventDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow text-slate-900 capitalize shadow-xs"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="islamic">Islamic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                  <TimeSelect
                    value={newEventStartTime}
                    onChange={setNewEventStartTime}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                  <TimeSelect
                    value={newEventEndTime}
                    onChange={setNewEventEndTime}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} /> Location
                </label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-2xl">
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle}
                className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.99]"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;