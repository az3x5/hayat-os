import React from 'react';
import { Bell, Check, Clock, ArrowRight, FileText } from 'lucide-react';
import { Reminder } from '../../types';
import { format, isToday, isTomorrow } from 'date-fns';

interface RemindersCardProps {
  reminders: Reminder[];
  onClick?: () => void;
}

const RemindersCard: React.FC<RemindersCardProps> = ({ reminders, onClick }) => {
  const getDueLabel = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a');
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
            <Bell size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Reminders</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-white group-hover:text-red-600 transition-colors">
            {reminders.filter(r => !r.completed).length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {reminders.slice(0, 3).map((reminder) => (
          <div key={reminder.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className={`
              w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
              ${reminder.completed ? 'bg-slate-100 border-slate-200' : 'border-slate-300'}
            `}>
               {reminder.completed && <Check size={12} className="text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {reminder.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-slate-400" />
                  <span className="text-xs text-slate-400">{getDueLabel(reminder.dueDate)}</span>
                </div>
                {reminder.notes && (
                  <div className="flex items-center gap-1 min-w-0">
                    <FileText size={10} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">{reminder.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${
              reminder.priority === 'high' ? 'bg-red-400' : 
              reminder.priority === 'medium' ? 'bg-orange-400' : 'bg-green-400'
            }`} />
          </div>
        ))}
        {reminders.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <p className="text-sm text-slate-400">All caught up!</p>
           </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-red-600 transition-colors">
          View All <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
};

export default RemindersCard;