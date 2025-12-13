
import React, { useEffect, useState, useCallback } from 'react';
import { Moon, ArrowRight, MapPin } from 'lucide-react';
import { PrayerTime } from '../../types';

interface IslamicCardProps {
  prayers: PrayerTime[];
  onClick?: () => void;
}

const IslamicCard: React.FC<IslamicCardProps> = ({ prayers, onClick }) => {
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  const calculateNextPrayer = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let upcoming = null;
    let minDiff = Infinity;

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      let diff = prayerTimeMinutes - currentTime;
      // If prayer is tomorrow, add 24 hours to difference
      if (diff < 0) diff += 24 * 60;

      if (diff < minDiff) {
        minDiff = diff;
        upcoming = prayer;
      }
    }
    
    setNextPrayer(upcoming);
  }, [prayers]);

  useEffect(() => {
    calculateNextPrayer();
    const timer = setInterval(calculateNextPrayer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [calculateNextPrayer]);

  return (
    <div 
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-3 shrink-0 relative z-10">
         <div className="flex items-center gap-2">
           <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <Moon size={16} />
          </div>
          <div>
             <h3 className="font-bold text-slate-900 text-sm leading-none">Prayer Times</h3>
             <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-medium">
                <MapPin size={8} /> New York
             </div>
          </div>
         </div>
         <button className="text-slate-300 hover:text-emerald-600 transition-colors">
           <ArrowRight size={16} />
         </button>
      </div>

      {/* Grid Content - Extremely Compact (4 columns, vertical stack) */}
      <div className="grid grid-cols-4 gap-2 relative z-10 mt-auto">
        {prayers.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.name;
          return (
            <div 
              key={prayer.name} 
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all border
                ${isNext 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm transform scale-105 z-10' 
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-200 hover:bg-white'
                }
              `}
            >
              <span className={`text-[9px] uppercase tracking-wide font-bold mb-0.5 ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{prayer.name.slice(0,3)}</span>
              <span className={`text-xs font-bold leading-none ${isNext ? 'text-white' : 'text-slate-900'}`}>{prayer.time}</span>
            </div>
          );
        })}
      </div>
      
      {/* Decorative Background - toned down */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-50/50 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
    </div>
  );
};

export default IslamicCard;
