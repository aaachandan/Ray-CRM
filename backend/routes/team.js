import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', adminOnly, (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

router.post('/', adminOnly, (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, name, email, hashedPassword, role || 'agent', phone || null);

  res.status(201).json({ id, name, email, role: role || 'agent', phone });
});

router.put('/:id', adminOnly, (req, res) => {
  const { name, role, phone } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare(
    'UPDATE users SET name=?, role=?, phone=? WHERE id=?'
  ).run(name || user.name, role || user.role, phone ?? user.phone, req.params.id);

  res.json({ message: 'User updated' });
});

router.delete('/:id', adminOnly, (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

export default router;
