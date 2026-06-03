import { Router } from 'express';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', (req, res) => {
  const userId = req.user.id;

  const totalLeads = db.prepare(
    'SELECT COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ?'
  ).get(userId, userId);

  const leadsByStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ? GROUP BY status'
  ).all(userId, userId);

  const leadsByService = db.prepare(
    'SELECT service, COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ? GROUP BY service'
  ).all(userId, userId);

  const totalCalls = db.prepare(
    'SELECT COUNT(*) as count FROM calls WHERE user_id = ?'
  ).get(userId);

  const totalMessages = db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE user_id = ?'
  ).get(userId);

  const pendingReminders = db.prepare(
    'SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND status = "pending"'
  ).get(userId);

  const recentLeads = db.prepare(
    'SELECT * FROM leads WHERE user_id = ? OR assigned_to = ? ORDER BY created_at DESC LIMIT 5'
  ).all(userId, userId);

  const recentActivities = db.prepare(
    `SELECT a.*, l.name as lead_name FROM activities a
     LEFT JOIN leads l ON a.lead_id = l.id
     WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 10`
  ).all(userId);

  res.json({
    totalLeads: totalLeads.count,
    leadsByStatus,
    leadsByService,
    totalCalls: totalCalls.count,
    totalMessages: totalMessages.count,
    pendingReminders: pendingReminders.count,
    recentLeads,
    recentActivities
  });
});

router.get('/team-performance', (req, res) => {
  const data = db.prepare(`
    SELECT u.id, u.name,
      (SELECT COUNT(*) FROM leads WHERE assigned_to = u.id OR user_id = u.id) as total_leads,
      (SELECT COUNT(*) FROM calls WHERE user_id = u.id) as total_calls,
      (SELECT COUNT(*) FROM messages WHERE user_id = u.id) as total_messages
    FROM users u ORDER BY total_leads DESC
  `).all();

  res.json(data);
});

router.get('/lead-trends', (req, res) => {
  const { days = 30 } = req.query;
  const data = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM leads
    WHERE created_at >= datetime('now', ?)
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(`-${days} days`);

  res.json(data);
});

export default router;
