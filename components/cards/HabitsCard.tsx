import React from 'react';
import { CheckCircle, Flame, ArrowRight } from 'lucide-react';
import { Habit } from '../../types';

interface HabitsCardProps {
  habits: Habit[];
  onClick?: () => void;
}

const HabitsCard: React.FC<HabitsCardProps> = ({ habits, onClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
       <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <CheckCircle size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Habits</h3>
        </div>
        <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1 hover:bg-emerald-50 rounded-lg">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {habits.slice(0, 3).map((habit) => (
          <div key={habit.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors -mx-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">{habit.name}</span>
              <div className="flex items-center gap-1 mt-1 text-orange-500">
                <Flame size={12} fill="currentColor" />
                <span className="text-xs font-bold">{habit.streak} day streak</span>
              </div>
            </div>
            
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${habit.completed 
                  ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md scale-100' 
                  : 'bg-slate-100 text-slate-300'
                }
              `}
            >
              <CheckCircle size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitsCard;