import express from 'express';
import cors from 'cors';

// Mock Data Store to replace Prisma
const db = {
  notes: [] as any[],
  reminders: [] as any[],
  habits: [] as any[],
  habitLogs: [] as any[],
  accounts: [] as any[],
  transactions: [] as any[],
  goals: [] as any[],
  healthLogs: [] as any[],
};

// Mock Prisma Client
const prisma = {
  note: {
    findMany: async ({ where }: any) => db.notes.filter((n: any) => n.userId === where.userId).sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()),
    create: async ({ data }: any) => { const n = { id: Date.now().toString(), updatedAt: new Date(), ...data }; db.notes.push(n); return n; },
    update: async ({ where, data }: any) => { 
        const i = db.notes.findIndex((n: any) => n.id === where.id); 
        if (i > -1) { db.notes[i] = { ...db.notes[i], ...data, updatedAt: new Date() }; return db.notes[i]; } 
        return null; 
    },
    delete: async ({ where }: any) => { db.notes = db.notes.filter((n: any) => n.id !== where.id); return { success: true }; }
  },
  reminder: {
    findMany: async ({ where }: any) => db.reminders.filter((r: any) => r.userId === where.userId).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    create: async ({ data }: any) => { const r = { id: Date.now().toString(), completed: false, ...data }; db.reminders.push(r); return r; },
    findUnique: async ({ where }: any) => db.reminders.find((r: any) => r.id === where.id),
    update: async ({ where, data }: any) => {
       const i = db.reminders.findIndex((r: any) => r.id === where.id);
       if (i > -1) { db.reminders[i] = { ...db.reminders[i], ...data }; return db.reminders[i]; }
       return null;
    }
  },
  habit: {
    findMany: async ({ where, include }: any) => {
      const habits = db.habits.filter((h: any) => h.userId === where.userId);
      if (include?.logs) {
        return habits.map((h: any) => ({
          ...h,
          logs: db.habitLogs.filter((l: any) => l.habitId === h.id)
        }));
      }
      return habits;
    },
    create: async ({ data }: any) => { const h = { id: Date.now().toString(), ...data }; db.habits.push(h); return h; }
  },
  habitLog: {
    create: async ({ data }: any) => { const l = { id: Date.now().toString(), ...data }; db.habitLogs.push(l); return l; }
  },
  account: {
    findMany: async ({ where }: any) => db.accounts.filter((a: any) => a.userId === where.userId),
    findUnique: async ({ where }: any) => db.accounts.find((a: any) => a.id === where.id),
    update: async ({ where, data }: any) => {
      const i = db.accounts.findIndex((a: any) => a.id === where.id);
      if (i > -1) { db.accounts[i] = { ...db.accounts[i], ...data }; return db.accounts[i]; }
      return null;
    }
  },
  transaction: {
     findMany: async ({ where, orderBy, take }: any) => {
        let txs = db.transactions.filter((t: any) => t.userId === where.userId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (take) txs = txs.slice(0, take);
        return txs;
     },
     create: async ({ data }: any) => { const t = { id: Date.now().toString(), ...data }; db.transactions.push(t); return t; }
  },
  savingsGoal: {
    findMany: async ({ where }: any) => db.goals.filter((g: any) => g.userId === where.userId),
  },
  healthLog: {
    findMany: async ({ where }: any) => db.healthLogs.filter((h: any) => h.userId === where.userId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    create: async ({ data }: any) => { const h = { id: Date.now().toString(), ...data }; db.healthLogs.push(h); return h; }
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors() as any);
app.use(express.json() as any);

// --- Middleware (Mock Auth) ---
// In a real app, use something like Passport.js, Clerk, or Supabase Auth
const getUserId = (req: any) => {
  // Return a static ID for demo purposes
  return "demo-user-123"; 
};

// --- NOTES Routes ---
app.get('/api/notes', async (req, res) => {
  const userId = getUserId(req);
  const notes = await prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const userId = getUserId(req);
  const { title, content, folder, isPinned, isFavorite, tags } = req.body;
  const note = await prisma.note.create({
    data: { title, content, folder, isPinned, isFavorite, tags, userId }
  });
  res.json(note);
});

app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const note = await prisma.note.update({
    where: { id },
    data: req.body
  });
  res.json(note);
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.note.delete({ where: { id } });
  res.json({ success: true });
});

// --- REMINDERS Routes ---
app.get('/api/reminders', async (req, res) => {
  const userId = getUserId(req);
  const reminders = await prisma.reminder.findMany({ where: { userId }, orderBy: { dueDate: 'asc' } });
  res.json(reminders);
});

app.post('/api/reminders', async (req, res) => {
  const userId = getUserId(req);
  const reminder = await prisma.reminder.create({
    data: { ...req.body, userId }
  });
  res.json(reminder);
});

app.patch('/api/reminders/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) return res.status(404).json({ error: "Not found" });
  
  const updated = await prisma.reminder.update({
    where: { id },
    data: { completed: !reminder.completed }
  });
  res.json(updated);
});

// --- HABITS Routes ---
app.get('/api/habits', async (req, res) => {
  const userId = getUserId(req);
  const habits = await prisma.habit.findMany({ 
    where: { userId },
    include: { logs: true } // Include history logs
  });
  res.json(habits);
});

app.post('/api/habits', async (req, res) => {
  const userId = getUserId(req);
  const habit = await prisma.habit.create({
    data: { ...req.body, userId }
  });
  res.json(habit);
});

app.post('/api/habits/:id/log', async (req, res) => {
  const { id } = req.params;
  const { date, status } = req.body; // YYYY-MM-DD, status
  
  const log = await prisma.habitLog.create({
    data: {
      habitId: id,
      date: new Date(date),
      status
    }
  });
  
  // Update Streak logic could go here
  res.json(log);
});

// --- FINANCE Routes ---
app.get('/api/finance/summary', async (req, res) => {
  const userId = getUserId(req);
  // Calculate summary from accounts and transactions
  const accounts = await prisma.account.findMany({ where: { userId } });
  const transactions = await prisma.transaction.findMany({ 
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100 
  });

  const balance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const income = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
  const expenses = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  res.json({ balance, income, expenses });
});

app.get('/api/transactions', async (req, res) => {
  const userId = getUserId(req);
  const transactions = await prisma.transaction.findMany({ 
    where: { userId }, 
    orderBy: { date: 'desc' },
    include: { account: true }
  });
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  const userId = getUserId(req);
  const { accountId, ...data } = req.body;
  
  const transaction = await prisma.transaction.create({
    data: { ...data, accountId, userId }
  });
  
  // Update account balance
  const account = await prisma.account.findUnique({ where: { id: accountId }});
  if (account) {
    const newBalance = data.type === 'income' 
       ? account.balance + data.amount 
       : account.balance - Math.abs(data.amount);
       
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance }
    });
  }
  
  res.json(transaction);
});

app.get('/api/finance/goals', async (req, res) => {
  const userId = getUserId(req);
  const goals = await prisma.savingsGoal.findMany({ where: { userId } });
  res.json(goals);
});

// --- HEALTH Routes ---
app.get('/api/health', async (req, res) => {
  const userId = getUserId(req);
  const logs = await prisma.healthLog.findMany({ where: { userId }, orderBy: { date: 'desc' } });
  res.json(logs);
});

app.post('/api/health', async (req, res) => {
  const userId = getUserId(req);
  const log = await prisma.healthLog.create({
    data: { ...req.body, userId }
  });
  res.json(log);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});