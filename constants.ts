import { Note, Reminder, Habit, HealthMetric, FinanceSummary, PrayerTime, CalendarEvent, Transaction, HealthLog, Dua, HadithCollection, FiqhTopic, QuranSurah, QuranVerse, Account, Budget, Reciter, SavingsGoal, Bill, Investment, Loan } from './types';
import { addHours, addDays, format } from 'date-fns';

export const MOCK_NOTES: Note[] = [
  { 
    id: '1', 
    title: 'Project Theta Ideas', 
    excerpt: 'Focus on minimalism and user-centric design patterns...', 
    content: 'Focus on minimalism and user-centric design patterns. We need to ensure that the interface breathes. \n\nKey points:\n- White space is active space.\n- Typography hierarchy must be strict.\n- Micro-interactions should be subtle but felt.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    folder: 'work',
    tags: ['design', 'strategy'],
    isPinned: true,
    isFavorite: false,
    color: 'blue'
  },
  { 
    id: '2', 
    title: 'Grocery List', 
    excerpt: 'Almond milk, avocados, spinach, chicken breast...', 
    content: '- Almond milk\n- Avocados (3)\n- Spinach\n- Chicken breast\n- Greek yogurt\n- Walnuts',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    folder: 'personal',
    tags: ['shopping'],
    isPinned: false,
    isFavorite: false
  },
  { 
    id: '3', 
    title: 'Book Notes: Atomic Habits', 
    excerpt: '1% better every day. The compound effect is real...', 
    content: '1% better every day. The compound effect is real.\n\n"You do not rise to the level of your goals. You fall to the level of your systems."\n\nHabit Stacking:\nAfter [CURRENT HABIT], I will [NEW HABIT].',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    folder: 'journal',
    tags: ['reading', 'self-improvement'],
    isPinned: true,
    isFavorite: true,
    color: 'amber'
  },
  { 
    id: '4', 
    title: 'Ramadan Goals', 
    excerpt: 'Complete Quran reading, daily Taraweeh, charity focus...', 
    content: '1. Complete Quran reading within the month.\n2. Attend daily Taraweeh prayers.\n3. Donate $100 weekly to charity.\n4. No social media after Maghrib.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    folder: 'islamic',
    tags: ['spiritual', 'goals'],
    isPinned: false,
    isFavorite: true,
    color: 'emerald'
  },
  { 
    id: '5', 
    title: 'Workout Plan - Week 4', 
    excerpt: 'Monday: Chest/Triceps, Tuesday: Back/Biceps...', 
    content: 'Monday: Chest/Triceps\nTuesday: Back/Biceps\nWednesday: Rest/Cardio\nThursday: Legs\nFriday: Shoulders/Abs\nSaturday: Active Recovery',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    folder: 'health',
    tags: ['gym', 'routine'],
    isPinned: false,
    isFavorite: false
  },
  { 
    id: '6', 
    title: 'Startup Idea: PlantCare', 
    excerpt: 'App that identifies plants and sets watering schedules...', 
    content: 'Concept: An app that uses AI to identify plants and automatically creates a watering/fertilizing schedule based on local weather.\n\nMonetization: Freemium model with premium expert advice.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    folder: 'ideas',
    tags: ['startup', 'tech'],
    isPinned: false,
    isFavorite: false,
    color: 'purple'
  }
];

export const MOCK_REMINDERS: Reminder[] = [
  { 
    id: '1', 
    title: 'Team Standup', 
    dueDate: addHours(new Date(), 2), 
    completed: false, 
    priority: 'high',
    category: 'work',
    tags: ['meeting']
  },
  { 
    id: '2', 
    title: 'Call Dentist', 
    dueDate: addDays(new Date(), 1), 
    completed: false, 
    priority: 'medium',
    category: 'health',
    notes: 'Reschedule appointment to next Tuesday'
  },
  { 
    id: '3', 
    title: 'Review PRs', 
    dueDate: addHours(new Date(), 5), 
    completed: false, 
    priority: 'low',
    category: 'work'
  },
  { 
    id: '4', 
    title: 'Pay Electricity Bill', 
    dueDate: addDays(new Date(), 3), 
    completed: false, 
    priority: 'high',
    category: 'finance',
    tags: ['bills']
  },
  { 
    id: '5', 
    title: 'Read Surah Al-Kahf', 
    dueDate: new Date(new Date().setDate(new Date().getDate() + (5 - new Date().getDay() + 7) % 7)), // Next Friday
    completed: false, 
    priority: 'medium',
    category: 'islamic'
  },
  { 
    id: '6', 
    title: 'Buy Groceries', 
    dueDate: addDays(new Date(), -1), // Overdue
    completed: false, 
    priority: 'medium',
    category: 'personal'
  }
];

// Helper to generate fake history
const generateHistory = (days: number, successRate: number) => {
  const history = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(new Date(), -i);
    const rand = Math.random();
    let status: 'completed' | 'skipped' | 'missed' = 'missed';
    if (rand < successRate) status = 'completed';
    else if (rand < successRate + 0.1) status = 'skipped';
    
    history.push({
      date: format(date, 'yyyy-MM-dd'),
      status
    });
  }
  return history;
};

export const MOCK_HABITS: Habit[] = [
  { 
    id: '1', 
    name: 'Morning Meditation', 
    category: 'health',
    frequency: 'daily',
    completed: true, 
    streak: 12,
    color: 'emerald',
    icon: 'Brain',
    status: 'active',
    history: generateHistory(30, 0.8),
    description: '10 minutes of mindfulness using Headspace.'
  },
  { 
    id: '2', 
    name: 'Read 30 mins', 
    category: 'personal',
    frequency: 'daily',
    completed: false, 
    streak: 5,
    color: 'blue',
    icon: 'BookOpen',
    status: 'active',
    history: generateHistory(30, 0.6),
    description: 'Reading "The Pragmatic Programmer".'
  },
  { 
    id: '3', 
    name: 'No Sugar', 
    category: 'health',
    frequency: 'daily',
    completed: true, 
    streak: 21,
    color: 'rose',
    icon: 'Ban',
    status: 'active',
    history: generateHistory(30, 0.9),
    description: 'Avoid all processed sugars and sweets.'
  },
  { 
    id: '4', 
    name: 'Deep Work Session', 
    category: 'work',
    frequency: 'daily',
    completed: false, 
    streak: 2,
    color: 'indigo',
    icon: 'Briefcase',
    status: 'active',
    history: generateHistory(30, 0.5),
    description: '2 hours of uninterrupted coding.'
  },
  { 
    id: '5', 
    name: 'Pray 5 Times', 
    category: 'islamic',
    frequency: 'daily',
    completed: false, 
    streak: 45,
    color: 'emerald',
    icon: 'Moon',
    status: 'active',
    history: generateHistory(30, 0.95),
    description: 'Fajr, Dhuhr, Asr, Maghrib, Isha.'
  },
  { 
    id: '6', 
    name: 'Weekly Review', 
    category: 'work',
    frequency: 'weekly',
    completed: false, 
    streak: 4,
    color: 'slate',
    icon: 'Calendar',
    status: 'active',
    history: generateHistory(30, 1.0), // Simplified for weekly
    description: 'Review goals and plan next week.'
  }
];

export const MOCK_HEALTH: HealthMetric[] = [
  { type: 'steps', value: '8,432', unit: 'steps', trend: 'up', timestamp: 'Today' },
  { type: 'sleep', value: '7h 12m', unit: 'hrs', trend: 'neutral', timestamp: 'Last Night' },
  { type: 'weight', value: '72.5', unit: 'kg', trend: 'down', timestamp: 'Today' },
];

export const MOCK_FINANCE: FinanceSummary = {
  balance: 12450.00,
  income: 4200.00,
  expenses: 1850.00,
};

export const MOCK_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Checking', type: 'checking', balance: 4520.50, change: 2.4, lastUpdated: new Date(), accountNumber: '**** 4521' },
  { id: '2', name: 'High Yield Savings', type: 'savings', balance: 12350.00, change: 5.1, lastUpdated: new Date(), accountNumber: '**** 8892' },
  { id: '3', name: 'Investment Portfolio', type: 'investment', balance: 28400.75, change: -1.2, lastUpdated: new Date(), accountNumber: '**** 1234' },
  { id: '4', name: 'Cash Wallet', type: 'cash', balance: 240.00, change: -15.0, lastUpdated: new Date() },
  { id: '5', name: 'Visa Signature', type: 'credit', balance: -1250.00, change: 5.4, lastUpdated: new Date(), accountNumber: '**** 9988' },
];

export const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'Food & Dining', limit: 600, spent: 450, period: 'monthly', color: 'orange' },
  { id: '2', category: 'Transportation', limit: 200, spent: 85, period: 'monthly', color: 'blue' },
  { id: '3', category: 'Shopping', limit: 300, spent: 210, period: 'monthly', color: 'purple' },
  { id: '4', category: 'Bills', limit: 1500, spent: 1200, period: 'monthly', color: 'red' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Freelance Payment', amount: 1200, type: 'income', category: 'salary', date: new Date(), account: 'checking', notes: 'Project Alpha milestone', tags: ['work'] },
  { id: '2', title: 'Grocery Store', amount: -154.20, type: 'expense', category: 'food', date: addDays(new Date(), -1), account: 'checking', tags: ['essentials'] },
  { id: '3', title: 'Monthly Rent', amount: -1200.00, type: 'expense', category: 'bills', date: addDays(new Date(), -3), account: 'checking', recurring: true },
  { id: '4', title: 'Stock Dividend', amount: 45.50, type: 'income', category: 'investment', date: addDays(new Date(), -5), account: 'savings' },
  { id: '5', title: 'Uber Ride', amount: -24.50, type: 'expense', category: 'transport', date: addDays(new Date(), -6), account: 'checking' },
  { id: '6', title: 'New Keyboard', amount: -129.99, type: 'expense', category: 'shopping', date: addDays(new Date(), -10), account: 'credit', notes: 'Mechanical Keychron' },
];

export const MOCK_SAVINGS_GOALS: SavingsGoal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 20000, currentAmount: 12350, deadline: addDays(new Date(), 180), color: 'emerald', icon: 'Shield' },
  { id: '2', name: 'New Laptop', targetAmount: 2500, currentAmount: 1800, deadline: addDays(new Date(), 45), color: 'blue', icon: 'Laptop' },
  { id: '3', name: 'Umrah Trip', targetAmount: 4000, currentAmount: 850, deadline: addDays(new Date(), 300), color: 'amber', icon: 'Plane' },
];

export const MOCK_BILLS: Bill[] = [
  { id: '1', title: 'Netflix Subscription', amount: 15.99, dueDate: addDays(new Date(), 5), isPaid: false, category: 'Entertainment', frequency: 'monthly', autoPay: true },
  { id: '2', title: 'Internet Service', amount: 65.00, dueDate: addDays(new Date(), 12), isPaid: false, category: 'Utilities', frequency: 'monthly', autoPay: true },
  { id: '3', title: 'Car Insurance', amount: 120.00, dueDate: addDays(new Date(), 20), isPaid: false, category: 'Insurance', frequency: 'monthly', autoPay: false },
  { id: '4', title: 'Gym Membership', amount: 45.00, dueDate: addDays(new Date(), -2), isPaid: true, category: 'Health', frequency: 'monthly', autoPay: true },
];

export const MOCK_INVESTMENTS: Investment[] = [
  { id: '1', name: 'Apple Inc.', symbol: 'AAPL', quantity: 15, currentPrice: 175.50, value: 2632.50, change: 1.2, type: 'stock' },
  { id: '2', name: 'Vanguard S&P 500', symbol: 'VOO', quantity: 40, currentPrice: 420.10, value: 16804.00, change: 0.5, type: 'etf' },
  { id: '3', name: 'Bitcoin', symbol: 'BTC', quantity: 0.15, currentPrice: 62000.00, value: 9300.00, change: -2.4, type: 'crypto' },
  { id: '4', name: 'Microsoft', symbol: 'MSFT', quantity: 10, currentPrice: 405.00, value: 4050.00, change: 0.8, type: 'stock' },
];

export const MOCK_LOANS: Loan[] = [
  { id: '1', name: 'Car Loan', totalAmount: 25000, remainingAmount: 15400, interestRate: 4.5, monthlyPayment: 420, dueDate: 15, provider: 'Chase Bank' },
  { id: '2', name: 'Student Loan', totalAmount: 40000, remainingAmount: 28000, interestRate: 3.2, monthlyPayment: 350, dueDate: 1, provider: 'Navient' },
];

// Generate past 30 days of data for charts
const generateHealthData = () => {
  const data: HealthLog[] = [];
  const today = new Date();
  
  // Weight: Slightly fluctuating around 73kg
  for(let i=0; i<30; i++) {
    data.push({
      id: `w-${i}`,
      type: 'weight',
      value: Number((73 + Math.sin(i/5) * 0.8 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      date: addDays(today, -i),
      note: i % 7 === 0 ? 'Weekly weigh-in' : undefined
    });
  }

  // Steps: Random between 4000 and 12000
  for(let i=0; i<30; i++) {
    data.push({
      id: `s-${i}`,
      type: 'steps',
      value: Math.floor(6000 + Math.random() * 6000),
      date: addDays(today, -i)
    });
  }

  // Sleep: Random between 5.5 and 8.5
  for(let i=0; i<30; i++) {
    data.push({
      id: `sl-${i}`,
      type: 'sleep',
      value: Number((6.5 + Math.random() * 2).toFixed(1)),
      date: addDays(today, -i)
    });
  }

  // Water: Random between 1500 and 3000 ml
  for(let i=0; i<30; i++) {
    data.push({
      id: `wa-${i}`,
      type: 'water',
      value: Math.floor(1800 + Math.random() * 1000),
      date: addDays(today, -i)
    });
  }
  
  // BP/Heart Rate (using bp type for HR in this mock for simplicity or added to types)
  for(let i=0; i<30; i++) {
    data.push({
      id: `bp-${i}`,
      type: 'bp', // Representing Avg Heart Rate
      value: Math.floor(65 + Math.random() * 10),
      date: addDays(today, -i)
    });
  }

  return data;
};

export const MOCK_HEALTH_HISTORY: HealthLog[] = generateHealthData();

export const MOCK_PRAYER_TIMES: PrayerTime[] = [
  { name: 'Tahajjud', time: '03:45' },
  { name: 'Fajr', time: '05:15' },
  { name: 'Sunrise', time: '06:30' },
  { name: 'Duha', time: '07:15' },
  { name: 'Dhuhr', time: '12:30' },
  { name: 'Jumuah', time: '13:15' },
  { name: 'Asr', time: '15:45' },
  { name: 'Maghrib', time: '18:12' },
  { name: 'Isha', time: '19:45' },
];

const todayDate = new Date();
export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Quarterly Review',
    startTime: '09:00',
    endTime: '10:30',
    category: 'work',
    date: todayDate,
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Lunch with Sarah',
    startTime: '12:30',
    endTime: '13:30',
    category: 'personal',
    date: todayDate,
    location: 'Downtown Bistro'
  },
  {
    id: '3',
    title: 'Gym Session',
    startTime: '17:30',
    endTime: '19:00',
    category: 'health',
    date: todayDate,
    location: 'FitFirst Gym'
  },
  {
    id: '4',
    title: 'Jummah Prayer',
    startTime: '13:00',
    endTime: '14:00',
    category: 'islamic',
    date: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + (5 - todayDate.getDay() + 7) % 7), // Next Friday
    location: 'Local Mosque'
  }
];

export const MOCK_DUAS: Dua[] = [
  // Morning & Evening
  {
    id: 'me-1',
    title: 'Morning Dua',
    category: 'Morning & Evening',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: "Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illallah wahdahu la sharika lah",
    translation: "We have entered the morning and at this very time the whole kingdom belongs to Allah, and all praise is due to Allah. There is no god but Allah, the One, having no partner.",
    reference: 'Sahih Muslim 4:2088',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },
  {
    id: 'me-2',
    title: 'Evening Dua',
    category: 'Morning & Evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: "Amsayna wa-amsal-mulku lillah, walhamdu lillah",
    translation: "We have entered the evening and at this very time the whole kingdom belongs to Allah, and all praise is due to Allah.",
    reference: 'Sahih Muslim',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },
  
  // Prayer (Salah)
  {
    id: 'p-1',
    title: 'Dua After Tashahhud (Before Salam)',
    category: 'Prayer',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    transliteration: "Allahumma inni a'udhu bika min 'adhabil-qabr, wa min 'adhab jahannam, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-masihid-dajjal",
    translation: "O Allah, I seek refuge in You from the punishment of the grave, and from the punishment of Hell-fire, and from the trials of life and death, and from the evil of the trial of the False Messiah.",
    reference: 'Al-Bukhari 2:102',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },
  {
    id: 'p-2',
    title: 'Dua Entering Mosque',
    category: 'Prayer',
    arabic: 'اللّهُـمَّ افْتَـحْ لي أَبْوابَ رَحْمَتـِك',
    transliteration: "Allahumma iftah li abwaba rahmatik",
    translation: "O Allah, open the gates of Your mercy for me.",
    reference: 'Muslim 1:494',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },

  // Daily
  {
    id: 'd-1',
    title: 'Before Sleeping',
    category: 'Sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your Name, O Allah, I die and I live.",
    reference: 'Al-Bukhari 11:113',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },
  {
    id: 'd-2',
    title: 'Waking Up',
    category: 'Sleep',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the return.",
    reference: 'Al-Bukhari 11:113',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },

  // Travel
  {
    id: 'tr-1',
    title: 'Dua for Travel',
    category: 'Travel',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin. Wa inna ila Rabbina lamunqalibun",
    translation: "Exalted is He who has subjected this to us, and we could not have [otherwise] subdued it. And indeed we, to our Lord, will return.",
    reference: 'Surah Az-Zukhruf 43:13-14',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },

  // Food
  {
    id: 'f-1',
    title: 'Before Eating',
    category: 'Food & Drink',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: "Bismillah",
    translation: "In the name of Allah.",
    reference: 'Al-Bukhari 7:88',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },
  {
    id: 'f-2',
    title: 'After Eating',
    category: 'Food & Drink',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ',
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: "Praise is to Allah Who has fed me this and provided it for me without any strength or power on my part.",
    reference: 'At-Tirmidhi 3:159',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },

  // Protection
  {
    id: 'pr-1',
    title: 'Protection from Evil',
    category: 'Protection',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahi-tammati min sharri ma khalaq",
    translation: "I seek refuge in the Perfect Words of Allah from the evil of what He has created.",
    reference: 'Muslim 4:2080',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },

  // Emotion
  {
    id: 'em-1',
    title: 'Dua for Anxiety & Sorrow',
    category: 'Emotion',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasal",
    translation: "O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness.",
    reference: 'Al-Bukhari 7:158',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },
  {
    id: 'em-2',
    title: 'Dua for Anger',
    category: 'Emotion',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: "A'udhu billahi minash-shaytanir-rajim",
    translation: "I seek refuge with Allah from Satan the Accursed.",
    reference: 'Al-Bukhari 10:465',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },

  // Family & Home
  {
    id: 'fh-1',
    title: 'Leaving Home',
    category: 'Home & Family',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    transliteration: "Bismillahi tawakkaltu 'alallahi, wa la hawla wa la quwwata illa billah",
    translation: "In the Name of Allah, I have placed my trust in Allah, there is no might and no power except by Allah.",
    reference: 'Abu Dawud 4:325',
    isFavorite: false,
    audioUrl: 'mock_audio'
  },
  {
    id: 'fh-2',
    title: 'Dua for Parents',
    category: 'Home & Family',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: "Rabbi irhamhuma kama rabbayani saghira",
    translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    reference: 'Surah Al-Isra 17:24',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },

  // Quranic Duas
  {
    id: 'q-1',
    title: 'Rabbana - Good in both worlds',
    category: 'Quranic',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil 'akhirati hasanatan waqina 'adhaban-nar",
    translation: "Our Lord! Give us in this world that which is good and in the Hereafter that which is good, and save us from the torment of the Fire.",
    reference: 'Surah Al-Baqarah 2:201',
    isFavorite: true,
    audioUrl: 'mock_audio'
  },
  {
    id: 'q-2',
    title: 'Rabbana - Increase Knowledge',
    category: 'Quranic',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidni 'ilma",
    translation: "My Lord, increase me in knowledge.",
    reference: 'Surah Taha 20:114',
    isFavorite: false,
    audioUrl: 'mock_audio'
  }
];

// NESTED HADITH DATA
export const MOCK_HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: 'bukhari',
    name: 'Sahih Al-Bukhari',
    arabicName: 'صحيح البخاري',
    totalHadith: 7563,
    volumes: [
      {
        id: 'vol-1',
        number: 1,
        title: 'Volume 1',
        books: [
          {
            id: 'book-1',
            number: 1,
            title: 'Revelation',
            chapters: [
              {
                id: 'chap-1',
                number: 1,
                title: 'How the Divine Inspiration started',
                narrations: [
                  {
                    id: 'h-1',
                    number: '1',
                    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
                    translation: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended. So whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for.",
                    grade: 'Sahih',
                    narrator: "Narrated 'Umar bin Al-Khattab"
                  }
                ]
              },
              {
                id: 'chap-2',
                number: 2,
                title: 'Invocation',
                narrations: [
                  {
                    id: 'h-2',
                    number: '2',
                    arabic: 'كَانَ النَّبِيُّ صلى الله عليه وسلم أَجْوَدَ النَّاسِ بِالْخَيْرِ، وَكَانَ أَجْوَدَ مَا يَكُونُ فِي رَمَضَانَ',
                    translation: "The Prophet (ﷺ) was the most generous of all the people, and he used to become more generous in Ramadan.",
                    grade: 'Sahih',
                    narrator: "Narrated Ibn 'Abbas"
                  }
                ]
              }
            ]
          },
          {
            id: 'book-2',
            number: 2,
            title: 'Belief (Al-Iman)',
            chapters: [
              {
                id: 'chap-3',
                number: 1,
                title: 'The Statement of the Prophet: "Islam is based on five"',
                narrations: [
                  {
                    id: 'h-7',
                    number: '7',
                    arabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ',
                    translation: "Islam is based on (the following) five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Apostle; to offer the (compulsory congregational) prayers dutifully and perfectly; to pay Zakat; to perform Hajj; and to observe fast during the month of Ramadan.",
                    grade: 'Sahih',
                    narrator: "Narrated Ibn 'Umar"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'vol-2',
        number: 2,
        title: 'Volume 2',
        books: [
          {
            id: 'book-13',
            number: 13,
            title: 'Friday Prayer (Jumuah)',
            chapters: [
               {
                 id: 'chap-10',
                 number: 1,
                 title: 'The necessity of the Friday prayer',
                 narrations: []
               }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    totalHadith: 7563,
    volumes: [
      {
        id: 'vol-m-1',
        number: 1,
        title: 'Volume 1',
        books: [
          {
            id: 'book-m-1',
            number: 1,
            title: 'Faith (Kitab Al Iman)',
            chapters: [
              {
                id: 'chap-m-1',
                number: 1,
                title: 'Explanation of Iman',
                narrations: [
                  {
                    id: 'hm-1',
                    number: '1',
                    arabic: 'الإِيمَانُ أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ',
                    translation: "Faith is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in Providence, both its good and its evil.",
                    grade: 'Sahih',
                    narrator: "Narrated Umar ibn al-Khattab"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const MOCK_HADITHS: any[] = []; 

export const MOCK_FIQH: FiqhTopic[] = [
  {
    id: '1',
    title: 'Wudu (Ablution)',
    category: 'Purification',
    content: 'Wudu is the Islamic act of washing parts of the body using water. The obligatory acts of Wudu are: \n1. Washing the face.\n2. Washing the arms up to the elbows.\n3. Wiping the head.\n4. Washing the feet up to the ankles.\n\nSunnah acts include saying Bismillah, using the Miswak, and washing parts three times.'
  },
  {
    id: '2',
    title: 'Salah (Prayer)',
    category: 'Worship',
    content: 'Salah is the second pillar of Islam. It is obligatory for every adult Muslim to perform five daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha.\n\nPrerequisites include: Purification (Wudu), covering the Awrah, facing the Qibla, and the entrance of prayer time.'
  },
  {
    id: '3',
    title: 'Fasting (Sawm)',
    category: 'Worship',
    content: 'Fasting in the month of Ramadan is obligatory for every adult, sane, healthy Muslim. It involves abstaining from food, drink, and marital relations from dawn (Fajr) until sunset (Maghrib).\n\nExceptions are made for travelers, the sick, pregnant or nursing women, and those menstruating.'
  },
  {
    id: '4',
    title: 'Zakat (Charity)',
    category: 'Worship',
    content: 'Zakat is a mandatory charitable contribution, the third pillar of Islam. It is calculated as 2.5% of one\'s surplus wealth held for a full lunar year (Hawl).\n\nRecipients include the poor, the needy, Zakat collectors, and those in debt.'
  },
  {
    id: '5',
    title: 'Halal Transactions',
    category: 'Business',
    content: 'Islamic finance principles require business transactions to be free from Riba (usury/interest), Gharar (excessive uncertainty), and Haram activities (e.g., gambling, alcohol).\n\nContracts must be transparent, and mutual consent is required.'
  }
];

export const MOCK_QURAN_SURAHS: QuranSurah[] = [
  { number: 1, name: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Fatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "سُورَةُ البَقَرَةِ", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "سُورَةُ آلِ عِمْرَانَ", englishName: "Aal-E-Imran", englishNameTranslation: "The Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "سُورَةُ النِّسَاءِ", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 18, name: "سُورَةُ الكَهْفِ", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 36, name: "سُورَةُ يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 67, name: "سُورَةُ المُلْكِ", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
];

export const MOCK_QURAN_VERSES: QuranVerse[] = [
  {
    id: '1:1',
    surahNumber: 1,
    verseNumber: 1,
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillaahir Rahmaanir Raheem",
    dhivehi: "ﷲ ގެ އިސްމުފުޅުން ފަށައިގަންނަމެވެ. އެކަލާނގެއީ، ރަޙްމާންވަންތަ ރަޙީމްވަންތަ ރަސްކަލާނގެއެވެ."
  },
  {
    id: '1:2',
    surahNumber: 1,
    verseNumber: 2,
    arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    translation: "[All] praise is [due] to Allah, Lord of the worlds -",
    transliteration: "Alhamdu lillaahi Rabbil 'aalameen",
    dhivehi: "ހުރިހާ ޙަމްދެއް ހުރީ، ޢާލަމްތަކުގެ ވެރި ﷲ އަށެވެ."
  },
  {
    id: '1:3',
    surahNumber: 1,
    verseNumber: 3,
    arabic: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translation: "The Entirely Merciful, the Especially Merciful,",
    transliteration: "Ar-Rahmaanir-Raheem",
    dhivehi: "އެކަލާނގެއީ، ރަޙްމާންވަންތަ ރަޙީމްވަންތަ ރަސްކަލާނގެއެވެ."
  },
  {
    id: '1:4',
    surahNumber: 1,
    verseNumber: 4,
    arabic: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
    translation: "Sovereign of the Day of Recompense.",
    transliteration: "Maaliki Yawmid-Deen",
    dhivehi: "ޤިޔާމަތް ދުވަހުގެ ވެރި ރަސްކަލާނގެއެވެ."
  }
];

export const MOCK_RECITERS: Reciter[] = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy' },
  { id: 'abdulbasit', name: 'Abdul Basit Abdul Samad' },
  { id: 'ghamdi', name: 'Saad Al Ghamdi' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'minshawi', name: 'Mohamed Siddiq El-Minshawi' },
];