
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  PieChart, 
  Plus, 
  Search, 
  ShoppingBag,
  Coffee,
  Zap, 
  Briefcase, 
  PanelLeft, 
  MoreVertical,
  Wallet,
  TrendingUp,
  Landmark,
  Trash2,
  Edit2,
  X,
  Calendar,
  Layers,
  Repeat,
  LayoutDashboard,
  Target,
  BarChart2,
  Shield,
  Laptop,
  Plane,
  Home,
  Scale,
  Percent,
  UserPlus,
  UserMinus,
  Users,
  Coins,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  MOCK_ACCOUNTS, 
  MOCK_BUDGETS, 
  MOCK_TRANSACTIONS, 
  MOCK_SAVINGS_GOALS, 
  MOCK_BILLS,
  MOCK_INVESTMENTS,
  MOCK_LOANS
} from '../../constants';
import { Transaction, Account, SavingsGoal, Bill, Investment, Budget, Loan } from '../../types';
import { format, isFuture, isPast, addMonths, isSameMonth, getDaysInMonth, isToday } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { useConfig } from '../../context/ConfigContext';
import DatePicker from '../ui/DatePicker';
import ConfirmModal from '../ui/ConfirmModal';

type FinanceView = 'overview' | 'transactions' | 'budgets' | 'goals' | 'bills' | 'investments' | 'loans';

interface LedgerEntry {
  id: string;
  personName: string;
  amount: number;
  dateLent: Date;
  dueDate?: Date;
  status: 'pending' | 'paid';
  note?: string;
}

// Reusable Switch Component (Untitled UI)
const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
  >
    <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// --- Charts Components ---

interface SpendingChartProps {
  transactions: Transaction[];
  timeRange: '6m' | 'ytd' | '1y';
}

const SpendingChart = ({ transactions, timeRange }: SpendingChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    const today = new Date();
    let startDate = new Date();
    let monthsCount = 6;

    if (timeRange === '6m') {
      startDate = addMonths(today, -5);
      monthsCount = 6;
    } else if (timeRange === '1y') {
      startDate = addMonths(today, -11);
      monthsCount = 12;
    } else if (timeRange === 'ytd') {
      // Logic Update: Show full Jan-Dec for current year
      startDate = new Date(today.getFullYear(), 0, 1);
      monthsCount = 12;
    }

    const months = [];
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      months.push(d);
    }

    return months.map(date => {
      const monthTxs = transactions.filter(t => isSameMonth(new Date(t.date), date));
      const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        month: format(date, 'MMM'),
        fullDate: format(date, 'MMMM yyyy'),
        income,
        expense
      };
    });
  }, [transactions, timeRange]);

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 100) * 1.1;
  const height = 240;
  const width = 600;
  const padding = 30; // Left padding for labels
  const bottomPadding = 20;
  const topPadding = 10;
  const chartHeight = height - bottomPadding - topPadding;
  const chartWidth = width - padding;
  
  const barWidth = timeRange === '1y' || timeRange === 'ytd' ? 12 : 20; 
  const groupGap = chartWidth / data.length;

  return (
    <div className="w-full flex flex-col justify-center items-center relative group/chart">
      <div className="w-full flex items-center justify-between mb-4 max-w-3xl px-4">
         <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {timeRange === 'ytd' ? `Jan - Dec ${new Date().getFullYear()}` : 'Spending vs Income'}
         </span>
         <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>Income</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-800"></div>Expense</div>
         </div>
      </div>
      
      {/* Interactive Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div 
            className="absolute bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl p-3 shadow-xl z-20 pointer-events-none transform -translate-x-1/2 transition-all duration-150 ease-out border border-white/10"
            style={{ 
                left: `${((padding + hoveredIndex * groupGap + groupGap / 2) / width) * 100}%`, 
                top: '-10px' 
            }}
        >
            <div className="font-bold mb-2 text-slate-300 border-b border-white/10 pb-1 whitespace-nowrap">{data[hoveredIndex].fullDate}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                   <span className="text-slate-300 font-medium">Income</span>
                </div>
                <span className="text-right font-bold font-mono text-emerald-300">+${data[hoveredIndex].income.toLocaleString()}</span>
                
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                   <span className="text-slate-300 font-medium">Expense</span>
                </div>
                <span className="text-right font-bold font-mono text-rose-300">-${data[hoveredIndex].expense.toLocaleString()}</span>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
        </div>
      )}

      <div className="relative w-full h-64 max-w-3xl">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Y-Axis Grid Lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
             const y = height - bottomPadding - (tick * chartHeight);
             return (
               <g key={tick}>
                 <line 
                    x1={padding} 
                    y1={y} 
                    x2={width} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                    strokeDasharray={tick === 0 ? "" : "4,4"} 
                 />
                 {tick > 0 && (
                    <text x={padding - 6} y={y + 3} textAnchor="end" className="fill-slate-300 text-[9px] font-medium font-mono">
                       ${Math.round(maxVal * tick / 1000)}k
                    </text>
                 )}
               </g>
             );
          })}

          {data.map((d, i) => {
            const xCenter = padding + i * groupGap + groupGap / 2;
            const incomeH = (d.income / maxVal) * chartHeight;
            const expenseH = (d.expense / maxVal) * chartHeight;
            const barSpacing = barWidth > 15 ? 3 : 1;
            const isHovered = hoveredIndex === i;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)} 
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
                style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.3 : 1 }}
              >
                {/* Active Group Highlight */}
                {isHovered && (
                   <rect 
                      x={padding + i * groupGap + 2} 
                      y={topPadding} 
                      width={groupGap - 4} 
                      height={height - bottomPadding - topPadding} 
                      className="fill-slate-50" 
                      rx={4}
                   />
                )}

                {/* Hit Area (Invisible) */}
                <rect x={padding + i * groupGap} y={topPadding} width={groupGap} height={height - bottomPadding - topPadding} fill="transparent" />
                
                {/* Income Bar */}
                <rect
                  x={xCenter - barWidth / 2 - barSpacing}
                  y={height - bottomPadding - incomeH}
                  width={barWidth}
                  height={Math.max(incomeH, 4)} // Min height
                  rx={2}
                  className={`transition-all duration-300 ${isHovered ? 'fill-emerald-400' : 'fill-emerald-500'}`}
                />
                
                {/* Expense Bar */}
                <rect
                  x={xCenter + barWidth / 2 + barSpacing}
                  y={height - bottomPadding - expenseH}
                  width={barWidth}
                  height={Math.max(expenseH, 4)} // Min height
                  rx={2}
                  className={`transition-all duration-300 ${isHovered ? 'fill-slate-700' : 'fill-slate-800'}`}
                />
                
                {/* X-Axis Label */}
                <text
                  x={xCenter}
                  y={height - 5}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const AllocationChart = ({ investments }: { investments: Investment[] }) => {
  const total = investments.reduce((sum, inv) => sum + inv.value, 0);
  
  const grouped = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.value;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped).map(([type, value]) => ({
    type,
    value,
    percent: total > 0 ? value / total : 0,
    color: type === 'stock' ? '#3b82f6' : type === 'crypto' ? '#f59e0b' : type === 'etf' ? '#10b981' : '#8b5cf6'
  })).sort((a, b) => b.value - a.value);

  // Calculate Dash Arrays for pure CSS/SVG Donut
  // Using circle with pathLength=100
  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full py-4 px-2">
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          {data.map((slice, i) => {
             const dashArray = `${slice.percent * 100} 100`;
             const dashOffset = -currentOffset * 100;
             currentOffset += slice.percent;
             
             return (
                <circle
                   key={i}
                   cx="20"
                   cy="20"
                   r="15.9155"
                   fill="transparent"
                   stroke={slice.color}
                   strokeWidth="5"
                   strokeDasharray={dashArray}
                   strokeDashoffset={dashOffset}
                   pathLength="100"
                   className="transition-all hover:stroke-[6] hover:opacity-90"
                >
                   <title>{slice.type}: {Math.round(slice.percent * 100)}%</title>
                </circle>
             );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-xs text-slate-400 font-medium">Total</span>
           <span className="text-sm font-bold text-slate-900">${(total / 1000).toFixed(1)}k</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full sm:w-auto min-w-0">
         {data.map((slice) => (
            <div key={slice.type} className="flex items-center justify-between gap-4 text-sm w-full">
               <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="text-slate-600 capitalize truncate">{slice.type}</span>
               </div>
               <span className="font-bold text-slate-900">{Math.round(slice.percent * 100)}%</span>
            </div>
         ))}
      </div>
    </div>
  );
};

const FinanceModule: React.FC = () => {
  const [activeView, setActiveView] = useState<FinanceView>('overview');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'transaction' | 'bill' | 'investment' | 'budget' | 'loan' | 'ledger' | 'account' | 'goal'>('transaction');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loanViewMode, setLoanViewMode] = useState<'liabilities' | 'assets'>('liabilities');
  const [trendTimeRange, setTrendTimeRange] = useState<'6m' | 'ytd' | '1y'>('ytd');
  const [budgetDate, setBudgetDate] = useState(new Date());
  
  // Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, type: string, title?: string } | null>(null);

  const { isPrivacyMode } = useTheme();
  // Consume Config for Categories
  const { financeCategories } = useConfig();

  // Data State - Now using setters to allow updates
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [goals, setGoals] = useState<SavingsGoal[]>(MOCK_SAVINGS_GOALS);
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [loans, setLoans] = useState<Loan[]>(MOCK_LOANS);
  
  // New Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([
    { id: '1', personName: 'Ahmed (Cousin)', amount: 500, dateLent: new Date('2024-02-15'), status: 'pending', note: 'Car repair help' },
    { id: '2', personName: 'Sarah Work', amount: 50, dateLent: new Date('2024-03-01'), status: 'paid', note: 'Lunch money' },
  ]);

  // Filters State
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txAccountFilter, setTxAccountFilter] = useState('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');
  const [txDateRange, setTxDateRange] = useState('all');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income'|'expense'>('expense');
  const [newCategory, setNewCategory] = useState(''); // Init empty, will default or select
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [newIsRecurring, setNewIsRecurring] = useState(false);
  
  // Type-specific Form State
  const [newInterestRate, setNewInterestRate] = useState(''); // Loan
  const [newProvider, setNewProvider] = useState(''); // Loan
  const [newLoanTerm, setNewLoanTerm] = useState('12'); // Loan Term in Months
  const [newSymbol, setNewSymbol] = useState(''); // Investment
  const [newQuantity, setNewQuantity] = useState(''); // Investment
  const [newFrequency, setNewFrequency] = useState<'monthly' | 'yearly'>('monthly'); // Bill
  const [newPersonName, setNewPersonName] = useState(''); // Ledger

  // Account Form State
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'checking' | 'savings' | 'investment' | 'cash' | 'credit'>('checking');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  // --- Derived Metrics ---
  const totalBalance = accounts.reduce((sum, acc) => acc.type === 'credit' ? sum - Math.abs(acc.balance) : sum + acc.balance, 0);
  const monthlyIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalLent = ledgerEntries.filter(l => l.status === 'pending').reduce((sum, l) => sum + l.amount, 0);

  // --- Navigation Items ---
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Layers },
    { id: 'budgets', label: 'Budgets & Analytics', icon: BarChart2 },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'bills', label: 'Bills & Recurring', icon: Calendar },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'loans', label: 'Debts & Ledger', icon: Scale },
  ];

  // --- Helpers ---
  const getCategoryIcon = (category: string) => {
    // Check dynamic config first
    const configItem = financeCategories.find(c => c.id === category || c.label.toLowerCase() === category.toLowerCase());
    if (configItem && configItem.icon) return configItem.icon;

    // Fallback normalization logic
    const cat = category.toLowerCase().trim();
    if (cat.includes('food') || cat.includes('dining')) return Coffee;
    if (cat.includes('shop')) return ShoppingBag;
    if (cat.includes('bill') || cat.includes('util')) return Zap;
    if (cat.includes('salary') || cat.includes('income') || cat.includes('business')) return Briefcase;
    if (cat.includes('transport') || cat.includes('travel') || cat.includes('fuel')) return CreditCard;
    if (cat.includes('invest') || cat.includes('stock')) return TrendingUp;
    if (cat.includes('entertainment') || cat.includes('fun') || cat.includes('movie')) return Laptop;
    if (cat.includes('insurance') || cat.includes('health') || cat.includes('medical')) return Shield;
    if (cat.includes('education') || cat.includes('school')) return Laptop;
    return DollarSign;
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return CreditCard;
      case 'savings': return Landmark;
      case 'investment': return PieChart;
      case 'credit': return CreditCard;
      case 'cash': return Wallet;
      default: return Wallet;
    }
  };

  const getGoalIcon = (iconName?: string) => {
     switch(iconName) {
        case 'Shield': return Shield;
        case 'Laptop': return Laptop;
        case 'Plane': return Plane;
        case 'Home': return Home;
        default: return Target;
     }
  }

  // --- Handlers ---
  const openModal = (type: 'transaction' | 'bill' | 'investment' | 'budget' | 'loan' | 'ledger' | 'account' | 'goal', item?: any) => {
     setAddModalType(type);
     
     if (item) {
        setEditingId(item.id);
        // Pre-fill based on type
        if (type === 'transaction') {
           setNewTitle(item.title);
           setNewAmount(Math.abs(item.amount).toString());
           setNewType(item.type);
           setNewCategory(item.category);
           setNewDate(new Date(item.date));
           setNewNotes(item.notes || '');
           setNewIsRecurring(item.recurring || false);
        } else if (type === 'account') {
           setNewAccountName(item.name);
           setNewAccountType(item.type);
           setNewAccountBalance(Math.abs(item.balance).toString());
           setNewAccountNumber(item.accountNumber ? item.accountNumber.replace('**** ', '') : '');
        } else if (type === 'budget') {
           setNewTitle(item.category);
           setNewAmount(item.limit.toString());
        } else if (type === 'goal') {
           setNewTitle(item.name);
           setNewAmount(item.targetAmount.toString());
           setNewDate(new Date(item.deadline));
        } else if (type === 'bill') {
           setNewTitle(item.title);
           setNewAmount(item.amount.toString());
           setNewDate(new Date(item.dueDate));
           setNewFrequency(item.frequency);
        } else if (type === 'investment') {
           setNewSymbol(item.symbol);
           setNewQuantity(item.quantity.toString());
           setNewAmount(item.currentPrice.toString());
        } else if (type === 'loan') {
           setNewTitle(item.name);
           setNewAmount(item.totalAmount.toString());
           setNewInterestRate(item.interestRate.toString());
           setNewProvider(item.provider);
        } else if (type === 'ledger') {
           setNewPersonName(item.personName);
           setNewAmount(item.amount.toString());
           setNewDate(new Date(item.dateLent));
           setNewNotes(item.note || '');
        }
     } else {
        // Reset for new item
        setEditingId(null);
        setNewTitle('');
        setNewAmount('');
        setNewDate(new Date());
        setNewInterestRate('');
        setNewProvider('');
        setNewLoanTerm('12');
        setNewSymbol('');
        setNewQuantity('');
        setNewPersonName('');
        setNewIsRecurring(false);
        setNewNotes('');
        
        // Account specific resets
        setNewAccountName('');
        setNewAccountType('checking');
        setNewAccountBalance('');
        setNewAccountNumber('');
        
        // Reset Category Default
        if (financeCategories.length > 0) {
           setNewCategory(financeCategories[0].label);
        } else {
           setNewCategory('Food & Dining');
        }
     }
     
     setIsAddModalOpen(true);
  }

  const handleAddItem = () => {
    // Basic validation
    if (addModalType === 'account') {
       if (!newAccountName || !newAccountBalance) return;
       const balanceVal = Number(newAccountBalance) * (newAccountType === 'credit' ? -1 : 1);
       
       if (editingId) {
          setAccounts(accounts.map(acc => acc.id === editingId ? {
             ...acc,
             name: newAccountName,
             type: newAccountType,
             balance: balanceVal,
             accountNumber: newAccountNumber ? `**** ${newAccountNumber.slice(-4)}` : undefined
          } : acc));
       } else {
          const newAccount: Account = {
             id: Date.now().toString(),
             name: newAccountName,
             type: newAccountType,
             balance: balanceVal,
             change: 0,
             lastUpdated: new Date(),
             accountNumber: newAccountNumber ? `**** ${newAccountNumber.slice(-4)}` : undefined
          };
          setAccounts([...accounts, newAccount]);
       }

    } else if (addModalType === 'ledger') {
      if (!newPersonName || !newAmount) return;
      if (editingId) {
         setLedgerEntries(ledgerEntries.map(l => l.id === editingId ? {
            ...l,
            personName: newPersonName,
            amount: Number(newAmount),
            dateLent: newDate,
            note: newNotes
         } : l));
      } else {
         const newEntry: LedgerEntry = {
           id: Date.now().toString(),
           personName: newPersonName,
           amount: Number(newAmount),
           dateLent: newDate,
           status: 'pending',
           note: newNotes
         };
         setLedgerEntries([newEntry, ...ledgerEntries]);
      }

    } else if (addModalType === 'transaction') {
      if (!newTitle || !newAmount) return;
      const amount = newType === 'expense' ? -Math.abs(Number(newAmount)) : Math.abs(Number(newAmount));
      
      if (editingId) {
         // Revert old transaction balance impact if needed (simplified here, just updating list)
         setTransactions(transactions.map(t => t.id === editingId ? {
            ...t,
            title: newTitle,
            amount: amount,
            type: newType,
            category: newCategory as any,
            date: newDate,
            notes: newNotes,
            recurring: newIsRecurring
         } : t));
      } else {
         const newTx: Transaction = {
           id: Date.now().toString(),
           title: newTitle,
           amount: amount,
           type: newType,
           category: newCategory as any,
           date: newDate,
           account: 'checking',
           notes: newNotes,
           recurring: newIsRecurring
         };
         setTransactions([newTx, ...transactions]);
         
         // Update Account Balance (Mocking update to 'checking' or default)
         setAccounts(accounts.map(acc => {
            if (acc.type === 'checking' || acc.id === accounts[0].id) {
               return { ...acc, balance: acc.balance + amount };
            }
            return acc;
         }));
      }

    } else if (addModalType === 'budget') {
       if (!newTitle || !newAmount) return;
       if (editingId) {
          setBudgets(budgets.map(b => b.id === editingId ? { ...b, category: newTitle, limit: Number(newAmount) } : b));
       } else {
          const newBudget: Budget = {
             id: Date.now().toString(),
             category: newTitle,
             limit: Number(newAmount),
             spent: 0,
             period: 'monthly',
             color: 'blue'
          };
          setBudgets([...budgets, newBudget]);
       }

    } else if (addModalType === 'goal') { 
       if (!newTitle || !newAmount) return;
       if (editingId) {
          setGoals(goals.map(g => g.id === editingId ? { ...g, name: newTitle, targetAmount: Number(newAmount), deadline: newDate } : g));
       } else {
          const newGoal: SavingsGoal = {
             id: Date.now().toString(),
             name: newTitle,
             targetAmount: Number(newAmount),
             currentAmount: 0,
             deadline: newDate,
             color: 'emerald',
             icon: 'Target'
          };
          setGoals([...goals, newGoal]);
       }

    } else if (addModalType === 'bill') {
       if (!newTitle || !newAmount) return;
       if (editingId) {
          setBills(bills.map(b => b.id === editingId ? { ...b, title: newTitle, amount: Number(newAmount), dueDate: newDate, frequency: newFrequency } : b));
       } else {
          const newBill: Bill = {
             id: Date.now().toString(),
             title: newTitle,
             amount: Number(newAmount),
             dueDate: newDate,
             isPaid: false,
             category: 'Utilities',
             frequency: newFrequency,
             autoPay: false
          };
          setBills([...bills, newBill]);
       }

    } else if (addModalType === 'investment') {
       if (!newSymbol || !newQuantity || !newAmount) return;
       const val = Number(newAmount) * Number(newQuantity);
       if (editingId) {
          setInvestments(investments.map(i => i.id === editingId ? {
             ...i,
             name: newSymbol,
             symbol: newSymbol.toUpperCase(),
             quantity: Number(newQuantity),
             currentPrice: Number(newAmount),
             value: val
          } : i));
       } else {
          const newInvest: Investment = {
             id: Date.now().toString(),
             name: newSymbol,
             symbol: newSymbol.toUpperCase(),
             quantity: Number(newQuantity),
             currentPrice: Number(newAmount),
             value: val,
             change: 0,
             type: 'stock'
          };
          setInvestments([...investments, newInvest]);
       }

    } else if (addModalType === 'loan') {
       if (!newTitle || !newAmount) return;
       if (editingId) {
          setLoans(loans.map(l => l.id === editingId ? {
             ...l,
             name: newTitle,
             totalAmount: Number(newAmount),
             interestRate: Number(newInterestRate),
             provider: newProvider || 'Bank'
          } : l));
       } else {
          const newLoan: Loan = {
             id: Date.now().toString(),
             name: newTitle,
             totalAmount: Number(newAmount),
             remainingAmount: Number(newAmount),
             interestRate: Number(newInterestRate),
             monthlyPayment: 0, // Mock calc
             dueDate: 1,
             provider: newProvider || 'Bank'
          };
          setLoans([...loans, newLoan]);
       }
    }
    
    // Reset & Close
    setIsAddModalOpen(false);
    setEditingId(null);
  };

  // --- Delete Handlers ---
  const requestDelete = (id: string, type: string, title?: string) => {
    setDeleteConfirmation({ id, type, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;
    const { id, type } = deleteConfirmation;

    switch (type) {
      case 'transaction':
        setTransactions(prev => prev.filter(t => t.id !== id));
        break;
      case 'budget':
        setBudgets(prev => prev.filter(b => b.id !== id));
        break;
      case 'goal':
        setGoals(prev => prev.filter(g => g.id !== id));
        break;
      case 'bill':
        setBills(prev => prev.filter(b => b.id !== id));
        break;
      case 'investment':
        setInvestments(prev => prev.filter(i => i.id !== id));
        break;
      case 'loan':
        setLoans(prev => prev.filter(l => l.id !== id));
        break;
      case 'account':
        setAccounts(prev => prev.filter(a => a.id !== id));
        break;
      case 'ledger':
        setLedgerEntries(prev => prev.filter(entry => entry.id !== id));
        break;
    }
    setDeleteConfirmation(null);
  };
  
  const toggleLedgerStatus = (id: string) => {
    setLedgerEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, status: entry.status === 'pending' ? 'paid' : 'pending' } : entry
    ));
  };

  // --- Views ---
  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Net Worth & Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between h-40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
           <div>
              <p className="text-slate-400 font-medium text-sm mb-1">Total Net Worth</p>
              <h2 className={`text-3xl font-bold tracking-tight ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                 ${totalBalance.toLocaleString()}
              </h2>
           </div>
           <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <TrendingUp size={16} />
              <span>+2.4% this month</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                 <ArrowUpRight size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Monthly Income</span>
           </div>
           <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                 ${monthlyIncome.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 mt-1">From all sources</p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                 <ArrowDownRight size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Monthly Expenses</span>
           </div>
           <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                 ${monthlyExpenses.toLocaleString()}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Limit: $2,500</p>
           </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Accounts</h3>
            <button 
               onClick={() => openModal('account')}
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg text-xs font-bold transition-colors"
            >
               <Plus size={14} /> Add Account
            </button>
         </div>
         <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:overflow-visible sm:pb-0 sm:px-0">
           <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-max sm:min-w-0">
              {accounts.map(acc => {
                 const Icon = getAccountIcon(acc.type);
                 return (
                    <div key={acc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow w-64 sm:w-auto relative group">
                       <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('account', acc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                             <Edit2 size={14} />
                          </button>
                          <button onClick={() => requestDelete(acc.id, 'account', acc.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                             <Trash2 size={14} />
                          </button>
                       </div>
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-2.5 rounded-lg border ${acc.type === 'savings' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                             <Icon size={20} />
                          </div>
                          {acc.type === 'credit' && <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-slate-200">Credit</span>}
                       </div>
                       <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 truncate pr-6">{acc.name}</p>
                          <p className={`text-xl font-bold ${acc.type === 'credit' ? 'text-slate-900' : 'text-slate-900'} ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                             {acc.type === 'credit' && acc.balance > 0 ? '-' : ''}${Math.abs(acc.balance).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-medium">{acc.accountNumber || 'No Account Num'}</p>
                       </div>
                    </div>
                 )
              })}
           </div>
         </div>
      </div>
    </div>
  );

  const renderTransactions = () => {
    const filtered = transactions.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(txSearchQuery.toLowerCase());
      const matchAccount = txAccountFilter === 'all' || t.account === txAccountFilter;
      const matchCategory = txCategoryFilter === 'all' || t.type === txCategoryFilter;
      
      let matchDate = true;
      const tDate = new Date(t.date);
      const now = new Date();
      
      if (txDateRange === 'thisMonth') {
         matchDate = isSameMonth(tDate, now);
      } else if (txDateRange === 'lastMonth') {
         matchDate = isSameMonth(tDate, addMonths(now, -1));
      } else if (txDateRange === 'last90Days') {
         const ninetyDaysAgo = new Date();
         ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
         matchDate = tDate >= ninetyDaysAgo;
      } else if (txDateRange === 'thisYear') {
         matchDate = tDate.getFullYear() === now.getFullYear();
      }

      return matchSearch && matchAccount && matchCategory && matchDate;
    });

    return (
       <div className="animate-fade-in max-w-6xl mx-auto h-full flex flex-col">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                   type="text" 
                   placeholder="Search transactions..." 
                   value={txSearchQuery}
                   onChange={(e) => setTxSearchQuery(e.target.value)}
                   className="w-full bg-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:ring-2 focus:ring-brand-500 outline-none placeholder-slate-400 text-slate-900 shadow-xs"
                />
             </div>
             <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <select 
                   value={txDateRange}
                   onChange={(e) => setTxDateRange(e.target.value)}
                   className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"
                >
                   <option value="all">All Dates</option>
                   <option value="thisMonth">This Month</option>
                   <option value="lastMonth">Last Month</option>
                   <option value="last90Days">Last 90 Days</option>
                   <option value="thisYear">This Year</option>
                </select>
                <select 
                   value={txCategoryFilter}
                   onChange={(e) => setTxCategoryFilter(e.target.value)}
                   className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-700 shadow-xs"
                >
                   <option value="all">All Categories</option>
                   <option value="income">Income</option>
                   <option value="expense">Expense</option>
                </select>
                <select 
                   value={txAccountFilter}
                   onChange={(e) => setTxAccountFilter(e.target.value)}
                   className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-base md:text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-700 shadow-xs"
                >
                   <option value="all">All Accounts</option>
                   <option value="checking">Checking</option>
                   <option value="savings">Savings</option>
                   <option value="credit">Credit</option>
                </select>
             </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
             <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-[calc(100vh-16rem)] p-0">
                  <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Transaction</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Account</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length > 0 ? (
                           filtered.map(tx => {
                             const Icon = getCategoryIcon(tx.category);
                             return (
                                 <tr key={tx.id} className="group hover:bg-slate-50 transition-colors">
                                   <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                         <div className="p-2 bg-slate-100 text-slate-500 rounded-full border border-slate-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                                             <Icon size={16} />
                                         </div>
                                         <div>
                                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                               {tx.title}
                                               {tx.recurring && <Repeat size={12} className="text-slate-400" />}
                                            </div>
                                         </div>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4 text-sm text-slate-500 capitalize">
                                       <span className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-medium">{tx.category}</span>
                                   </td>
                                   <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                                   <td className="px-6 py-4 text-sm text-slate-500 capitalize">{tx.account}</td>
                                   <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'} ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>
                                       {tx.type === 'income' ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                          <button onClick={() => openModal('transaction', tx)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                             <Edit2 size={16} />
                                          </button>
                                          <button onClick={() => requestDelete(tx.id, 'transaction')} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                   </td>
                                 </tr>
                             )
                           })
                        ) : (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                 No transactions found for the selected filters.
                              </td>
                           </tr>
                        )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
       </div>
    );
  };

  const renderBudgets = () => {
    const currentMonthName = format(budgetDate, 'MMMM yyyy');
    const daysInMonth = getDaysInMonth(budgetDate);
    
    const today = new Date();
    let daysLeftLabel = '';
    let daysLeftClass = 'text-slate-500 bg-slate-50 border-slate-100';

    if (isSameMonth(budgetDate, today)) {
       const daysLeft = daysInMonth - today.getDate();
       daysLeftLabel = `${daysLeft} days left`;
    } else if (budgetDate < today) {
       daysLeftLabel = 'Closed';
       daysLeftClass = 'text-slate-400 bg-slate-50 border-slate-100';
    } else {
       daysLeftLabel = 'Upcoming';
       daysLeftClass = 'text-blue-600 bg-blue-50 border-blue-100';
    }

    return (
     <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Budgets & Analytics</h2>
            <button 
               onClick={() => openModal('budget')} 
               className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
            >
               <Plus size={16} /> Add Budget
            </button>
        </div>
        
        {/* Trends Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Spending Trends</h3>
              <select 
                value={trendTimeRange}
                onChange={(e) => setTrendTimeRange(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                 <option value="6m">Last 6 Months</option>
                 <option value="ytd">This Year (Jan-Dec)</option>
                 <option value="1y">Last Year</option>
              </select>
           </div>
           <SpendingChart transactions={transactions} timeRange={trendTimeRange} />
        </div>

        {/* Budgets Grid Section */}
        <div>
           {/* Month Navigation for Budgets */}
           <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                       onClick={() => setBudgetDate(addMonths(budgetDate, -1))}
                       className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                       <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-bold text-slate-900 min-w-[140px] text-center text-sm">{currentMonthName}</h3>
                    <button 
                       onClick={() => setBudgetDate(addMonths(budgetDate, 1))}
                       className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                       <ChevronRight size={20} />
                    </button>
                 </div>
                 <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wide flex items-center gap-1.5 border ${daysLeftClass}`}>
                    <Clock size={14} />
                    {daysLeftLabel}
                 </span>
           </div>

           {/* Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {budgets.map(budget => {
                    const currentMonthSpent = transactions.filter(t => {
                        const tDate = new Date(t.date);
                        const isSameMonthTx = isSameMonth(tDate, budgetDate);
                        if (!isSameMonthTx || t.type !== 'expense') return false;
                        
                        // Robust matching: Exact or legacy
                        // If user linked via exact string, this hits.
                        if (t.category === budget.category) return true;
                        
                        // Legacy/Simple mapping fallback for old data or default categories
                        if (budget.category === 'Food & Dining' && t.category === 'food') return true;
                        if (budget.category === 'Transportation' && t.category === 'transport') return true;
                        if (budget.category === 'Shopping' && t.category === 'shopping') return true;
                        if (budget.category === 'Bills' && t.category === 'bills') return true;
                        
                        // Case insensitive fallback
                        return t.category.toLowerCase() === budget.category.toLowerCase();
                    }).reduce((sum, t) => sum + Math.abs(t.amount), 0);

                    const percent = Math.min(100, (currentMonthSpent / budget.limit) * 100);
                    const remaining = budget.limit - currentMonthSpent;
                    const Icon = getCategoryIcon(budget.category);
                    
                    const barColor = percent > 100 ? 'bg-red-500' : percent > 85 ? 'bg-orange-500' : 'bg-brand-600';
                    const iconBg = percent > 100 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600';

                    return (
                       <div key={budget.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => openModal('budget', budget)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                <Edit2 size={14} />
                             </button>
                             <button onClick={() => requestDelete(budget.id, 'budget', budget.category)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                <Trash2 size={14} />
                             </button>
                          </div>
                          
                          <div className="flex justify-between items-start mb-4">
                             <div className={`p-2.5 rounded-xl border border-transparent group-hover:border-slate-100 transition-colors ${iconBg}`}>
                                <Icon size={20} />
                             </div>
                             <span className={`text-xs font-bold px-2 py-1 rounded-md ${percent > 100 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'}`}>
                                {Math.round(percent)}%
                             </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-900 text-lg mb-1 truncate pr-6" title={budget.category}>{budget.category}</h3>
                          <div className={`text-sm font-medium mb-4 ${isPrivacyMode ? 'blur-sm' : 'text-slate-500'}`}>
                             ${currentMonthSpent.toLocaleString()} <span className="text-slate-400">/ ${budget.limit.toLocaleString()}</span>
                          </div>

                          <div className="mt-auto">
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                <div 
                                   className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                                   style={{ width: `${percent}%` }}
                                />
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Remaining</span>
                                <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                   ${remaining.toLocaleString()}
                                </span>
                             </div>
                          </div>
                       </div>
                    )
                 })}
                 
                 <button 
                    onClick={() => openModal('budget')}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all min-h-[200px] group"
                 >
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-white transition-colors border border-slate-100 group-hover:border-brand-200">
                        <Plus size={24} />
                    </div>
                    <span className="font-semibold text-sm">Create New Budget</span>
                 </button>
           </div>
        </div>
     </div>
    );
  };

  const renderGoals = () => (
     <div className="animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-slate-900">Savings Goals</h2>
           <button 
             onClick={() => openModal('goal')} 
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
           >
              <Plus size={16} /> New Goal
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {goals.map(goal => {
              const percent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              const Icon = getGoalIcon(goal.icon);
              return (
                 <div key={goal.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => openModal('goal', goal)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => requestDelete(goal.id, 'goal', goal.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 size={16} />
                       </button>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                       <div className={`p-3 rounded-xl bg-${goal.color}-50 text-${goal.color}-600 border border-${goal.color}-100`}>
                          <Icon size={24} />
                       </div>
                       <span className="text-2xl font-bold text-slate-900">{percent}%</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 pr-10">{goal.name}</h3>
                    <p className={`text-sm text-slate-500 mb-4 ${isPrivacyMode ? 'blur-sm' : ''}`}>Target: ${goal.targetAmount.toLocaleString()}</p>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                       <div 
                          className={`h-full bg-${goal.color}-500 rounded-full`}
                          style={{ width: `${percent}%` }} 
                       />
                    </div>
                 </div>
              )
           })}
        </div>
     </div>
  );

  const renderBills = () => (
     <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recurring Bills</h2>
          <button 
             onClick={() => openModal('bill')} 
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
          >
             <Plus size={16} /> Add Bill
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="divide-y divide-slate-100">
              {bills.map(bill => (
                 <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                          <span className="text-[10px] uppercase text-slate-400 leading-none mb-1">{format(new Date(bill.dueDate), 'MMM')}</span>
                          <span className="text-lg text-slate-900 leading-none">{format(new Date(bill.dueDate), 'd')}</span>
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900">{bill.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                             <span className="capitalize">{bill.frequency}</span>
                             {bill.autoPay && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold border border-emerald-100">Auto-pay</span>}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className={`font-bold text-lg text-slate-900 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>${bill.amount}</p>
                          <button className={`text-xs font-bold mt-1 px-3 py-1 rounded-full border transition-colors ${bill.isPaid ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                             {bill.isPaid ? 'Paid' : 'Mark Paid'}
                          </button>
                       </div>
                       <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('bill', bill)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                             <Edit2 size={16} />
                          </button>
                          <button onClick={() => requestDelete(bill.id, 'bill', bill.title)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  );

  const renderLoansAndLedger = () => (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Debts & Ledger</h2>
        <div className="flex items-center gap-2">
           {loanViewMode === 'assets' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg text-xs font-medium text-emerald-700 mr-2 border border-emerald-100">
                 <ArrowUpRight size={14} /> Total Lent: <span className={`${isPrivacyMode ? 'blur-sm' : ''}`}>${totalLent.toLocaleString()}</span>
              </div>
           )}
           <button 
             onClick={() => openModal(loanViewMode === 'liabilities' ? 'loan' : 'ledger')} 
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
           >
             <Plus size={16} /> 
             {loanViewMode === 'liabilities' ? 'Add Debt' : 'Add Ledger Entry'}
           </button>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-xl mb-8 w-full max-w-md mx-auto border border-slate-200">
         <button 
            onClick={() => setLoanViewMode('liabilities')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${loanViewMode === 'liabilities' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
         >
            <UserMinus size={16} />
            Money I Owe (Debt)
         </button>
         <button 
            onClick={() => setLoanViewMode('assets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${loanViewMode === 'assets' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
         >
            <UserPlus size={16} />
            Money Owed to Me
         </button>
      </div>

      {loanViewMode === 'liabilities' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {loans.map(loan => {
             const progress = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100;
             return (
               <div key={loan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('loan', loan)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                       <Edit2 size={16} />
                    </button>
                    <button onClick={() => requestDelete(loan.id, 'loan', loan.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                       <Trash2 size={16} />
                    </button>
                 </div>
                 
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                     <Scale size={24} />
                   </div>
                   <div className="text-right pr-8">
                     <div className={`text-2xl font-bold text-slate-900 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>${loan.remainingAmount.toLocaleString()}</div>
                     <div className="text-xs text-slate-500 font-medium">Remaining Principal</div>
                   </div>
                 </div>

                 <h3 className="text-lg font-bold text-slate-900">{loan.name}</h3>
                 <p className="text-sm text-slate-500 mb-6">{loan.provider} • {loan.interestRate}% APR</p>

                 <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">
                       <span>Progress</span>
                       <span>{Math.round(progress)}% Paid</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-900 rounded-full" style={{ width: `${progress}%` }} />
                     </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <div>
                       <div className="text-xs text-slate-400 font-bold uppercase">Monthly</div>
                       <div className={`font-bold text-slate-900 ${isPrivacyMode ? 'blur-sm' : ''}`}>${loan.monthlyPayment}</div>
                     </div>
                     <div className="text-right">
                       <div className="text-xs text-slate-400 font-bold uppercase">Due Day</div>
                       <div className="font-bold text-slate-900">{loan.dueDate}th</div>
                     </div>
                   </div>
                 </div>
               </div>
             )
           })}
         </div>
      ) : (
         <div className="space-y-4">
            {ledgerEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ledgerEntries.map(entry => (
                     <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openModal('ledger', entry)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                              <Edit2 size={16} />
                           </button>
                           <button onClick={() => requestDelete(entry.id, 'ledger')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                              <Trash2 size={16} />
                           </button>
                        </div>
                        
                        <div className="flex items-start gap-4 mb-4">
                           <div className={`p-3 rounded-xl ${entry.status === 'paid' ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              <Coins size={24} />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">{entry.personName}</h3>
                              <p className="text-xs text-slate-500 font-medium">Lent on {format(new Date(entry.dateLent), 'MMM d, yyyy')}</p>
                           </div>
                        </div>

                        <div className="flex items-end justify-between mb-6">
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                              <p className={`text-2xl font-bold ${entry.status === 'paid' ? 'text-slate-400 line-through decoration-2' : 'text-slate-900'} ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                                 ${entry.amount.toLocaleString()}
                              </p>
                           </div>
                           <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${entry.status === 'paid' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {entry.status}
                           </div>
                        </div>

                        {entry.note && (
                           <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic mb-4 border border-slate-100">
                              "{entry.note}"
                           </div>
                        )}

                        <button 
                           onClick={() => toggleLedgerStatus(entry.id)}
                           className={`w-full py-3 rounded-xl font-bold text-sm transition-all border shadow-sm ${
                              entry.status === 'paid' 
                              ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50' 
                              : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                           }`}
                        >
                           {entry.status === 'paid' ? 'Mark as Pending' : 'Mark as Repaid'}
                        </button>
                     </div>
                  ))}
              </div>
            ) : (
               <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm border border-slate-200">
                     <Users size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Ledger Entries</h3>
                  <p className="text-slate-500 mt-2">Track money you've lent to friends and family here.</p>
                  <button 
                     onClick={() => openModal('ledger')}
                     className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                     Add First Entry
                  </button>
               </div>
            )}
         </div>
      )}
    </div>
  );

  const renderInvestments = () => (
     <div className="animate-fade-in max-w-6xl mx-auto">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900">Portfolio Holdings</h2>
           <button 
             onClick={() => openModal('investment')} 
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
           >
             <Plus size={16} /> Add Investment
           </button>
         </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                       <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
                          <tr>
                             <th className="px-6 py-4">Asset</th>
                             <th className="px-6 py-4">Price</th>
                             <th className="px-6 py-4">Balance</th>
                             <th className="px-6 py-4 text-right">Change</th>
                             <th className="px-6 py-4 w-10"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {investments.map(inv => (
                             <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="font-bold text-slate-900">{inv.symbol}</div>
                                   <div className="text-xs text-slate-500">{inv.name}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">${inv.currentPrice.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                   <div className={`font-bold text-slate-900 ${isPrivacyMode ? 'blur-sm select-none' : ''}`}>${inv.value.toLocaleString()}</div>
                                   <div className="text-xs text-slate-500">{inv.quantity} shares</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <span className={`font-bold text-sm ${inv.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {inv.change > 0 ? '+' : ''}{inv.change}%
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <button onClick={() => openModal('investment', inv)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                         <Edit2 size={16} />
                                      </button>
                                      <button onClick={() => requestDelete(inv.id, 'investment', inv.symbol)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                         <Trash2 size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Allocation</h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[320px] flex items-center justify-center">
                 <AllocationChart investments={investments} />
              </div>
           </div>
        </div>
     </div>
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Navigation Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
             <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
                <Wallet size={22} />
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-900">Finance</h2>
                <p className="text-xs text-slate-500 font-medium">Wealth Management</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
               const Icon = item.icon;
               return (
                  <button
                     key={item.id}
                     onClick={() => { setActiveView(item.id as FinanceView); setMobileMenuOpen(false); }}
                     className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === item.id ? 'bg-white shadow-sm text-emerald-700 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}
                  >
                     <Icon size={18} className={activeView === item.id ? 'text-emerald-600' : 'text-slate-400'} />
                     {item.label}
                  </button>
               )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
         
         {/* Top Header */}
         <div className="h-16 px-6 md:px-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
               >
                 <MoreVertical size={20} />
               </button>
               <button 
                 onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                 className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
               >
                 <PanelLeft size={20} />
               </button>
               <h2 className="text-xl font-bold text-slate-900 capitalize">
                  {navItems.find(n => n.id === activeView)?.label}
               </h2>
            </div>
            
            <button 
               onClick={() => openModal('transaction')}
               className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
               <Plus size={16} />
               <span className="hidden sm:inline">Add Transaction</span>
            </button>
         </div>

         {/* Scrollable View Area */}
         <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'transactions' && renderTransactions()}
            {activeView === 'budgets' && renderBudgets()}
            {activeView === 'goals' && renderGoals()}
            {activeView === 'bills' && renderBills()}
            {activeView === 'investments' && renderInvestments()}
            {activeView === 'loans' && renderLoansAndLedger()}
         </div>
      </div>

      {/* Generic Add Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
               
               {/* Header */}
               <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{editingId ? 'Edit' : 'Add'} {addModalType === 'ledger' ? 'Ledger Entry' : addModalType}</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                     <X size={20} />
                  </button>
               </div>

               {/* Body */}
               <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {addModalType === 'transaction' && (
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                       <button 
                          onClick={() => setNewType('expense')}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newType === 'expense' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          Expense
                       </button>
                       <button 
                          onClick={() => setNewType('income')}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newType === 'income' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          Income
                       </button>
                    </div>
                  )}

                  {addModalType === 'account' ? (
                     // Account Fields
                     <>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Name</label>
                           <input 
                              type="text" 
                              autoFocus
                              value={newAccountName}
                              onChange={(e) => setNewAccountName(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                              placeholder="e.g. Main Checking" 
                           />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Type</label>
                              <select 
                                 value={newAccountType}
                                 onChange={(e) => setNewAccountType(e.target.value as any)}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none capitalize transition-shadow text-slate-900 shadow-xs"
                              >
                                 {['checking', 'savings', 'investment', 'cash', 'credit'].map(t => (
                                    <option key={t} value={t} className="capitalize">{t}</option>
                                 ))}
                              </select>
                           </div>
                           <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Balance</label>
                               <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                  <input 
                                     type="number" 
                                     value={newAccountBalance}
                                     onChange={(e) => setNewAccountBalance(e.target.value)}
                                     className="w-full bg-white pl-9 pr-3 border border-slate-300 rounded-lg py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                     placeholder="0.00" 
                                  />
                               </div>
                           </div>
                        </div>

                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number (Optional)</label>
                           <input 
                              type="text" 
                              value={newAccountNumber}
                              onChange={(e) => setNewAccountNumber(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                              placeholder="Last 4 digits" 
                           />
                        </div>
                     </>
                  ) : (
                     // Standard Fields for other types
                     <>
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                           {addModalType === 'budget' ? 'Limit Amount' : addModalType === 'loan' ? 'Total Amount' : addModalType === 'goal' ? 'Target Amount' : 'Amount'}
                           </label>
                           <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                              <input 
                                 type="number" 
                                 autoFocus
                                 value={newAmount}
                                 onChange={(e) => setNewAmount(e.target.value)}
                                 className="w-full bg-white text-3xl font-bold border border-slate-300 rounded-xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-300 text-slate-900 shadow-xs" 
                                 placeholder="0.00" 
                              />
                           </div>
                        </div>

                        {addModalType !== 'ledger' && (
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                 {addModalType === 'budget' ? 'Category Name' : addModalType === 'loan' ? 'Loan Name' : addModalType === 'bill' ? 'Biller Name' : addModalType === 'goal' ? 'Goal Name' : 'Description'}
                              </label>
                              <input 
                                 type="text" 
                                 value={newTitle}
                                 onChange={(e) => setNewTitle(e.target.value)}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                 placeholder={addModalType === 'budget' ? "e.g. Groceries" : "e.g. Grocery Run"} 
                              />
                           </div>
                        )}

                        {/* Dynamic Fields based on Type */}
                        <div className="grid grid-cols-2 gap-4">
                           {addModalType === 'transaction' && (
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                              <select 
                                 value={newCategory} 
                                 onChange={(e) => setNewCategory(e.target.value)}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none capitalize transition-shadow text-slate-900 shadow-xs"
                              >
                                 {financeCategories.map(c => (
                                    <option key={c.id} value={c.label}>{c.label}</option>
                                 ))}
                              </select>
                           </div>
                           )}
                           
                           {addModalType === 'ledger' && (
                              <div className="col-span-2">
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Person Name</label>
                                 <input 
                                    type="text" 
                                    value={newPersonName}
                                    onChange={(e) => setNewPersonName(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                    placeholder="e.g. Ahmed" 
                                 />
                              </div>
                           )}
                           
                           {addModalType === 'bill' && (
                              <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Frequency</label>
                                 <select 
                                    value={newFrequency}
                                    onChange={(e) => setNewFrequency(e.target.value as any)}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none capitalize transition-shadow text-slate-900 shadow-xs"
                                 >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                 </select>
                              </div>
                           )}

                           {addModalType === 'loan' && (
                              <>
                                 <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Interest Rate %</label>
                                    <div className="relative">
                                       <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                       <input 
                                          type="number" 
                                          value={newInterestRate}
                                          onChange={(e) => setNewInterestRate(e.target.value)}
                                          className="w-full bg-white pl-9 border border-slate-300 rounded-lg py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                          placeholder="4.5"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Term (Months)</label>
                                    <select 
                                       value={newLoanTerm}
                                       onChange={(e) => setNewLoanTerm(e.target.value)}
                                       className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow text-slate-900 shadow-xs"
                                    >
                                       {[6, 12, 24, 36, 48, 60, 72].map(m => (
                                          <option key={m} value={m}>{m} Months</option>
                                       ))}
                                    </select>
                                 </div>
                              </>
                           )}

                           {addModalType === 'investment' && (
                              <>
                                 <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Symbol</label>
                                    <input 
                                       type="text" 
                                       value={newSymbol}
                                       onChange={(e) => setNewSymbol(e.target.value)}
                                       className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none uppercase transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                       placeholder="AAPL"
                                    />
                                 </div>
                                 <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
                                    <input 
                                       type="number" 
                                       value={newQuantity}
                                       onChange={(e) => setNewQuantity(e.target.value)}
                                       className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                       placeholder="10"
                                    />
                                 </div>
                              </>
                           )}
                           
                           <div className={addModalType === 'investment' || addModalType === 'ledger' ? 'col-span-2' : ''}>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                 {addModalType === 'bill' ? 'Due Date' : addModalType === 'ledger' ? 'Date Lent' : addModalType === 'goal' ? 'Deadline' : 'Date'}
                               </label>
                               <DatePicker 
                                  selected={newDate}
                                  onSelect={setNewDate}
                               />
                           </div>
                        </div>
                        
                        {addModalType === 'transaction' && (
                           <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg shadow-sm">
                                    <Repeat size={18} />
                                 </div>
                                 <div>
                                    <div className="text-sm font-bold text-slate-900">Recurring</div>
                                    <div className="text-xs text-slate-500">Repeat monthly</div>
                                 </div>
                              </div>
                              <Switch checked={newIsRecurring} onChange={() => setNewIsRecurring(!newIsRecurring)} />
                           </div>
                        )}

                        {(addModalType === 'transaction' || addModalType === 'ledger') && (
                          <div>
                             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
                             <textarea 
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs"
                                rows={2}
                                placeholder="Additional details..."
                             />
                          </div>
                        )}

                        {addModalType === 'loan' && (
                           <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Provider / Lender</label>
                              <input 
                                 type="text" 
                                 value={newProvider}
                                 onChange={(e) => setNewProvider(e.target.value)}
                                 className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" 
                                 placeholder="e.g. Chase Bank" 
                              />
                           </div>
                        )}
                     </>
                  )}
               </div>

               {/* Footer */}
               <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-2xl">
                  <button 
                     onClick={handleAddItem}
                     disabled={addModalType === 'account' ? !newAccountName || !newAccountBalance : ((addModalType === 'ledger' ? !newPersonName : !newTitle) || !newAmount)}
                     className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.99]"
                  >
                     {editingId ? 'Save Changes' : `Save ${addModalType === 'ledger' ? 'Entry' : addModalType === 'account' ? 'Account' : addModalType}`}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirmation?.type === 'ledger' ? 'Entry' : deleteConfirmation?.type}`}
        message={`Are you sure you want to delete this ${deleteConfirmation?.type}? This action cannot be undone.`}
      />
    </div>
  );
};

export default FinanceModule;
