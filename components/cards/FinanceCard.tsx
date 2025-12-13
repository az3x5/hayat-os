import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { FinanceSummary } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface FinanceCardProps {
  data: FinanceSummary;
  onClick?: () => void;
}

const FinanceCard: React.FC<FinanceCardProps> = ({ data, onClick }) => {
  const { isPrivacyMode } = useTheme();

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
            <DollarSign size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Finance</h3>
        </div>
        <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1 hover:bg-emerald-50 rounded-lg">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="mb-6">
        <span className="text-sm font-medium text-slate-500">Total Balance</span>
        <h2 className={`text-3xl font-bold text-slate-900 tracking-tight mt-1 group-hover:text-emerald-700 transition-colors ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
          ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 group-hover:bg-emerald-50 transition-colors">
          <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
            <ArrowUpRight size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Income</span>
          </div>
          <p className={`text-lg font-bold text-slate-900 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>${data.income.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 group-hover:bg-rose-50 transition-colors">
          <div className="flex items-center gap-1.5 text-rose-700 mb-1">
            <ArrowDownRight size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Expenses</span>
          </div>
           <p className={`text-lg font-bold text-slate-900 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>${data.expenses.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;