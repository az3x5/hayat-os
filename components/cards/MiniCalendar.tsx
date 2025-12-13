import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';

interface MiniCalendarProps {
  onClick?: () => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ onClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth,
    end: endOfMonth(currentDate),
  });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Calculate filler days for the grid start (naive implementation for demo)
  const startDay = startOfMonth.getDay();
  // Adjust for Monday start (0 is Sunday in JS Date)
  const emptyDays = startDay === 0 ? 6 : startDay - 1; 

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex gap-1 border border-slate-200 rounded-lg p-0.5 bg-white shadow-xs" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors active:bg-slate-200"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors active:bg-slate-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-semibold text-slate-400 py-1 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center flex-1">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full transition-all font-medium
                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}
                ${isSelected ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100 hover:bg-brand-700' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;