import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CRM Backend running on port ${PORT}`);
});
