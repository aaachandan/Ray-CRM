import { Router } from 'express';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const totalLeads = db.prepare(
    isAdmin ? 'SELECT COUNT(*) as count FROM leads' : 'SELECT COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ?'
  ).get(...(isAdmin ? [] : [userId, userId]));

  const leadsByStatus = db.prepare(
    isAdmin ? 'SELECT status, COUNT(*) as count FROM leads GROUP BY status' : 'SELECT status, COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ? GROUP BY status'
  ).all(...(isAdmin ? [] : [userId, userId]));

  const leadsByService = db.prepare(
    isAdmin ? 'SELECT service, COUNT(*) as count FROM leads GROUP BY service' : 'SELECT service, COUNT(*) as count FROM leads WHERE user_id = ? OR assigned_to = ? GROUP BY service'
  ).all(...(isAdmin ? [] : [userId, userId]));

  const totalCalls = db.prepare(
    isAdmin ? 'SELECT COUNT(*) as count FROM calls' : 'SELECT COUNT(*) as count FROM calls WHERE user_id = ?'
  ).get(...(isAdmin ? [] : [userId]));

  const totalMessages = db.prepare(
    isAdmin ? 'SELECT COUNT(*) as count FROM messages' : 'SELECT COUNT(*) as count FROM messages WHERE user_id = ?'
  ).get(...(isAdmin ? [] : [userId]));

  const pendingReminders = db.prepare(
    isAdmin ? 'SELECT COUNT(*) as count FROM reminders WHERE status = "pending"' : 'SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND status = "pending"'
  ).get(...(isAdmin ? [] : [userId]));

  const recentLeads = db.prepare(
    isAdmin ? 'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5' : 'SELECT * FROM leads WHERE user_id = ? OR assigned_to = ? ORDER BY created_at DESC LIMIT 5'
  ).all(...(isAdmin ? [] : [userId, userId]));

  const recentActivities = db.prepare(
    isAdmin
      ? 'SELECT a.*, l.name as lead_name FROM activities a LEFT JOIN leads l ON a.lead_id = l.id ORDER BY a.created_at DESC LIMIT 10'
      : 'SELECT a.*, l.name as lead_name FROM activities a LEFT JOIN leads l ON a.lead_id = l.id WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 10'
  ).all(...(isAdmin ? [] : [userId]));

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
