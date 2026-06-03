import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const { lead_id } = req.query;
  let sql = `SELECT c.*, l.name as lead_name, l.phone as lead_phone, u.name as user_name
    FROM calls c
    JOIN leads l ON c.lead_id = l.id
    JOIN users u ON c.user_id = u.id
    WHERE (c.user_id = ? OR l.assigned_to = ?)`;
  const params = [req.user.id, req.user.id];

  if (lead_id) {
    sql += ' AND c.lead_id = ?';
    params.push(lead_id);
  }

  sql += ' ORDER BY c.created_at DESC';
  const calls = db.prepare(sql).all(...params);
  res.json(calls);
});

router.post('/', (req, res) => {
  const { lead_id, type, duration, notes, outcome } = req.body;
  if (!lead_id) return res.status(400).json({ error: 'Lead ID required' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO calls (id, lead_id, user_id, type, duration, notes, outcome) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, lead_id, req.user.id, type || 'outgoing', duration || 0, notes || '', outcome || '');

  db.prepare(
    'INSERT INTO activities (id, user_id, lead_id, type, description) VALUES (?, ?, ?, ?, ?)'
  ).run(uuidv4(), req.user.id, lead_id, 'call_logged', `Call logged (${type || 'outgoing'}, ${duration}s)`);

  const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(id);
  res.status(201).json(call);
});

export default router;
