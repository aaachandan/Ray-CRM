import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const { status, search, assigned_to, service } = req.query;
  const isAdmin = req.user.role === 'admin';
  let sql = 'SELECT l.*, u.name as assigned_name, u2.name as creator_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id LEFT JOIN users u2 ON l.user_id = u2.id';
  const params = [];

  if (!isAdmin) {
    sql += ' WHERE (l.user_id = ? OR l.assigned_to = ?)';
    params.push(req.user.id, req.user.id);
  } else {
    sql += ' WHERE 1=1';
  }

  if (status) {
    sql += ' AND l.status = ?';
    params.push(status);
  }
  if (service) {
    sql += ' AND l.service = ?';
    params.push(service);
  }
  if (assigned_to) {
    sql += ' AND l.assigned_to = ?';
    params.push(assigned_to);
  }
  if (search) {
    sql += ' AND (l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.shop_name LIKE ? OR l.address LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  sql += ' ORDER BY l.created_at DESC';
  const leads = db.prepare(sql).all(...params);
  res.json(leads);
});

router.get('/:id', (req, res) => {
  const lead = db.prepare(
    'SELECT l.*, u.name as assigned_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.id = ?'
  ).get(req.params.id);

  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

router.post('/', (req, res) => {
  const { name, phone, email, shop_name, address, service, source, notes, assigned_to } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO leads (id, user_id, name, phone, email, shop_name, address, service, source, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name, phone || null, email || null, shop_name || null, address || null, service || 'general', source || 'manual', notes || null, assigned_to || null);

  db.prepare(
    'INSERT INTO activities (id, user_id, lead_id, type, description) VALUES (?, ?, ?, ?, ?)'
  ).run(uuidv4(), req.user.id, id, 'lead_created', `Lead "${name}" created`);

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  res.status(201).json(lead);
});

router.put('/:id', (req, res) => {
  const { name, phone, email, shop_name, address, service, source, status, notes, assigned_to } = req.body;
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  db.prepare(
    'UPDATE leads SET name=?, phone=?, email=?, shop_name=?, address=?, service=?, source=?, status=?, notes=?, assigned_to=?, updated_at=datetime("now") WHERE id=?'
  ).run(
    name || lead.name,
    phone ?? (lead.phone || null),
    email ?? (lead.email || null),
    shop_name ?? (lead.shop_name || null),
    address ?? (lead.address || null),
    service || lead.service,
    source || lead.source,
    status || lead.status,
    notes ?? (lead.notes || null),
    assigned_to ?? (lead.assigned_to || null),
    req.params.id
  );

  if (status && status !== lead.status) {
    db.prepare(
      'INSERT INTO activities (id, user_id, lead_id, type, description) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), req.user.id, req.params.id, 'status_change', `Status changed to "${status}"`);
  }

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted' });
});

export default router;
