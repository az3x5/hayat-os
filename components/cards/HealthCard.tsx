import React from 'react';
import { Activity, Footprints, Moon, Weight, ArrowRight } from 'lucide-react';
import { HealthMetric } from '../../types';

interface HealthCardProps {
  metrics: HealthMetric[];
  onClick?: () => void;
}

const HealthCard: React.FC<HealthCardProps> = ({ metrics, onClick }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'steps': return Footprints;
      case 'sleep': return Moon;
      case 'weight': return Weight;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'steps': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'sleep': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'weight': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 group-hover:bg-rose-100 transition-colors">
            <Activity size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Health</h3>
        </div>
        <button className="text-slate-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-50 rounded-lg">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric, idx) => {
          const Icon = getIcon(metric.type);
          const colorClass = getColor(metric.type);

          return (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100 group-hover:border-slate-200 group-hover:bg-white transition-all">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-none">
                    {metric.value} <span className="text-[10px] font-medium text-slate-500">{metric.unit}</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 capitalize mt-1">{metric.type}</div>
                </div>
              </div>
              {/* Simple Trend Indicator */}
              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                metric.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 
                metric.trend === 'down' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthCard;