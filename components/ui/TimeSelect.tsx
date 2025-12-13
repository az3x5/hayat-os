import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface TimeSelectProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ value, onChange, className = "", placeholder = "Select time" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Generate times (15 min intervals)
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const h = i.toString().padStart(2, '0');
      const m = j.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected time
  useEffect(() => {
    if (isOpen && listRef.current) {
        const selectedEl = listRef.current.querySelector('[data-selected="true"]');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'center' });
        }
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-white border rounded-lg px-3 py-2.5 text-left text-sm shadow-xs transition-all duration-200
          flex items-center gap-2.5 outline-none
          ${isOpen ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'}
          ${value ? 'text-slate-900' : 'text-slate-500'}
        `}
      >
        <Clock size={18} className="text-slate-500 flex-shrink-0" />
        <span className="flex-1 truncate font-medium">{value || placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[280px] flex flex-col origin-top-left">
           <div className="overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" ref={listRef}>
              {times.map(time => (
                 <button
                    key={time}
                    data-selected={time === value}
                    onClick={() => {
                       onChange(time);
                       setIsOpen(false);
                    }}
                    className={`
                       w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group
                       ${time === value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                 >
                    <span>{time}</span>
                    {time === value && <Check size={16} className="text-brand-600" />}
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelect;