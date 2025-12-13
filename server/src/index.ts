import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

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
  const account = await prisma.account.findUnique({ where: { id: accountId } });
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