import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const { status, lead_id } = req.query;
  let sql = `SELECT r.*, l.name as lead_name
    FROM reminders r
    LEFT JOIN leads l ON r.lead_id = l.id
    WHERE r.user_id = ?`;
  const params = [req.user.id];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  if (lead_id) {
    sql += ' AND r.lead_id = ?';
    params.push(lead_id);
  }

  sql += ' ORDER BY r.due_date ASC';
  const reminders = db.prepare(sql).all(...params);
  res.json(reminders);
});

router.post('/', (req, res) => {
  const { lead_id, title, description, due_date, priority } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: 'Title and due date required' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO reminders (id, lead_id, user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, lead_id || null, req.user.id, title, description || '', due_date, priority || 'medium');

  res.status(201).json({ id, lead_id, title, description, due_date, priority, status: 'pending' });
});

router.put('/:id/complete', (req, res) => {
  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  db.prepare('UPDATE reminders SET status = ?, completed_at = datetime("now") WHERE id = ?')
    .run('completed', req.params.id);

  res.json({ message: 'Reminder completed' });
});

router.put('/:id', (req, res) => {
  const { title, description, due_date, priority, status } = req.body;
  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  db.prepare(
    'UPDATE reminders SET title=?, description=?, due_date=?, priority=?, status=? WHERE id=?'
  ).run(
    title || reminder.title,
    description ?? reminder.description,
    due_date || reminder.due_date,
    priority || reminder.priority,
    status || reminder.status,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM reminders WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const reminder = db.prepare('SELECT * FROM reminders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Reminder deleted' });
});

export default router;
