import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ selected, onSelect, className = "", placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper for startOfMonth since it might be missing in some environments
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [selected, isOpen]);

  const handlePrevMonth = () => setViewDate(addMonths(viewDate, -1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate),
  });

  // Calculate padding days
  const startDay = startOfMonth(viewDate).getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-white border rounded-lg px-3 py-2.5 text-left text-sm shadow-xs transition-all duration-200
          flex items-center gap-2.5 outline-none
          ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'}
          ${selected ? 'text-slate-900' : 'text-slate-500'}
        `}
      >
        <CalendarIcon size={18} className="text-slate-500 flex-shrink-0" />
        <span className="flex-1 truncate font-medium">
          {selected ? format(selected, 'PPP') : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 p-5 bg-white rounded-xl shadow-xl border border-slate-200 w-[320px] animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <button 
              onClick={handlePrevMonth} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-base font-semibold text-slate-900">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <button 
              onClick={handleNextMonth} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map(i => <div key={`padding-${i}`} />)}
            {days.map(day => {
              const isSelected = selected && isSameDay(day, selected);
              const isCurrent = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    onSelect(day);
                    setIsOpen(false);
                  }}
                  className={`
                    h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all duration-200
                    ${isSelected 
                      ? 'bg-brand-600 text-white shadow-md font-semibold' 
                      : isCurrent 
                        ? 'text-brand-700 font-bold bg-brand-50 hover:bg-brand-100' 
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
             <button 
              onClick={() => { onSelect(new Date()); setIsOpen(false); }}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-md hover:bg-brand-50 transition-colors"
             >
               Today
             </button>
             <button 
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
             >
               Cancel
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;