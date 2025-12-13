import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'hayatos-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// ==================== HEALTH CHECK ====================
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'HayatOS API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register, /api/auth/me',
      notes: '/api/notes',
      reminders: '/api/reminders',
      habits: '/api/habits',
      health: '/api/health',
      finance: '/api/finance/summary, /api/transactions',
      calendar: '/api/events',
      settings: '/api/settings'
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==================== AUTH TYPES ====================

interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
}

// ==================== AUTH MIDDLEWARE ====================

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper to get user ID from authenticated request
const getUserId = (req: AuthRequest): string => {
  return req.userId || '';
};

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication

// --- NOTES Routes ---
app.get('/api/notes', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(notes);
});

app.post('/api/notes', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const { title, content, folder, isPinned, isFavorite, tags, color, excerpt } = req.body;
  const note = await prisma.note.create({
    data: { title, content, folder, isPinned, isFavorite, tags, color, excerpt, userId }
  });
  res.json(note);
});

app.put('/api/notes/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const note = await prisma.note.update({
    where: { id },
    data: req.body
  });
  res.json(note);
});

app.delete('/api/notes/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.note.delete({ where: { id } });
  res.json({ success: true });
});

// --- REMINDERS Routes ---
app.get('/api/reminders', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { dueDate: 'asc' }
  });
  res.json(reminders);
});

app.post('/api/reminders', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const reminder = await prisma.reminder.create({
    data: { ...req.body, userId }
  });
  res.json(reminder);
});

app.patch('/api/reminders/:id/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.reminder.update({
    where: { id },
    data: { completed: !reminder.completed }
  });
  res.json(updated);
});

app.delete('/api/reminders/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.reminder.delete({ where: { id } });
  res.json({ success: true });
});

// --- HABITS Routes ---
app.get('/api/habits', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { logs: true }
  });
  res.json(habits);
});

app.post('/api/habits', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const habit = await prisma.habit.create({
    data: { ...req.body, userId }
  });
  res.json(habit);
});

app.post('/api/habits/:id/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { date, status } = req.body;

  const log = await prisma.habitLog.create({
    data: {
      habitId: id,
      date: new Date(date),
      status
    }
  });

  res.json(log);
});

// --- FINANCE Routes ---
app.get('/api/finance/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const accounts = await prisma.account.findMany({ where: { userId } });
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100
  });

  const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  res.json({ balance, income, expenses });
});

app.get('/api/accounts', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const accounts = await prisma.account.findMany({ where: { userId } });
  res.json(accounts);
});

app.post('/api/accounts', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const account = await prisma.account.create({
    data: { ...req.body, userId }
  });
  res.json(account);
});

app.get('/api/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { account: true }
  });
  res.json(transactions);
});

app.post('/api/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
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

app.get('/api/finance/goals', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const goals = await prisma.savingsGoal.findMany({ where: { userId } });
  res.json(goals);
});

app.get('/api/budgets', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const budgets = await prisma.budget.findMany({ where: { userId } });
  res.json(budgets);
});

// --- HEALTH Routes ---
app.get('/api/health', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const logs = await prisma.healthLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });
  res.json(logs);
});

app.post('/api/health', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const log = await prisma.healthLog.create({
    data: { ...req.body, userId }
  });
  res.json(log);
});

// --- CALENDAR Routes ---
app.get('/api/events', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const events = await prisma.calendarEvent.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });
  res.json(events);
});

app.post('/api/events', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const event = await prisma.calendarEvent.create({
    data: { ...req.body, userId }
  });
  res.json(event);
});

app.put('/api/events/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const event = await prisma.calendarEvent.update({
    where: { id },
    data: req.body
  });
  res.json(event);
});

app.delete('/api/events/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.calendarEvent.delete({ where: { id } });
  res.json({ success: true });
});

// --- USER SETTINGS Routes ---
app.get('/api/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  let settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId }
    });
  }

  res.json(settings);
});

app.put('/api/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: req.body,
    create: { userId, ...req.body }
  });
  res.json(settings);
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});