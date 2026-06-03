import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import db from './config/db.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import callRoutes from './routes/calls.js';
import whatsappRoutes from './routes/whatsapp.js';
import reminderRoutes from './routes/reminders.js';
import teamRoutes from './routes/team.js';
import reportRoutes from './routes/reports.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/export/leads', authenticate, (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  const header = 'id,name,shop_name,address,phone,email,service,source,status,notes,assigned_to,created_at,updated_at';
  const rows = leads.map(l => `"${l.id}","${l.name}","${l.shop_name || ''}","${(l.address || '').replace(/"/g,'""')}","${l.phone || ''}","${l.email || ''}","${l.service || ''}","${l.source || ''}","${l.status || ''}","${(l.notes || '').replace(/"/g,'""')}","${l.assigned_to || ''}","${l.created_at}","${l.updated_at}"`);
  const csv = '\ufeff' + header + '\n' + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=raycrm-leads.csv');
  res.send(csv);
});

app.get('/api/reset', (req, res) => {
  db.exec(`
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS reminders;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS calls;
    DROP TABLE IF EXISTS leads;
    DROP TABLE IF EXISTS users;
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'agent', phone TEXT,
      avatar TEXT, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, phone TEXT,
      email TEXT, service TEXT DEFAULT 'general', source TEXT DEFAULT 'manual',
      status TEXT DEFAULT 'new', notes TEXT, assigned_to TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'outgoing', duration INTEGER DEFAULT 0,
      notes TEXT, outcome TEXT, recording_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, user_id TEXT NOT NULL,
      content TEXT NOT NULL, type TEXT DEFAULT 'whatsapp',
      direction TEXT DEFAULT 'sent', status TEXT DEFAULT 'sent',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY, lead_id TEXT, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT, due_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending', priority TEXT DEFAULT 'medium',
      created_at TEXT DEFAULT (datetime('now')), completed_at TEXT,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lead_id TEXT,
      type TEXT NOT NULL, description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
  `);
  res.json({ status: 'ok', message: 'All data reset successfully' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CRM Backend running on port ${PORT}`);
});
