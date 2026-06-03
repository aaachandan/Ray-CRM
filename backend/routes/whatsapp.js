import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const { lead_id } = req.query;
  let sql = `SELECT m.*, l.name as lead_name, u.name as user_name
    FROM messages m
    JOIN leads l ON m.lead_id = l.id
    JOIN users u ON m.user_id = u.id
    WHERE (m.user_id = ? OR l.assigned_to = ?)`;
  const params = [req.user.id, req.user.id];

  if (lead_id) {
    sql += ' AND m.lead_id = ?';
    params.push(lead_id);
  }

  sql += ' ORDER BY m.created_at DESC';
  const messages = db.prepare(sql).all(...params);
  res.json(messages);
});

router.post('/', (req, res) => {
  const { lead_id, content, type } = req.body;
  if (!lead_id || !content) return res.status(400).json({ error: 'Lead ID and content required' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO messages (id, lead_id, user_id, content, type) VALUES (?, ?, ?, ?, ?)'
  ).run(id, lead_id, req.user.id, content, type || 'whatsapp');

  db.prepare(
    'INSERT INTO activities (id, user_id, lead_id, type, description) VALUES (?, ?, ?, ?, ?)'
  ).run(uuidv4(), req.user.id, lead_id, 'message_sent', `Message sent via ${type || 'whatsapp'}`);

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  res.status(201).json(message);
});

export default router;
