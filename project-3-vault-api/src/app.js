const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- helpers ----------
const isId = (v) => /^\d+$/.test(String(v));
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUser(b, partial = false) {
  const errors = [];
  if (!partial || b.name !== undefined) if (!str(b.name)) errors.push('name is required');
  if (!partial || b.email !== undefined) if (!EMAIL_RE.test(str(b.email))) errors.push('valid email is required');
  if (!partial || b.age !== undefined) if (!Number.isInteger(b.age) || b.age < 18) errors.push('age must be an integer >= 18');
  return errors;
}

// ---------- Pillar 3: CRUD (all queries are parameterized — Pillar 4) ----------

// CREATE
app.post('/users', (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const info = db
    .prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)')
    .run(str(req.body.name), str(req.body.email).toLowerCase(), req.body.age);
  res.status(201).json(db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid));
});

// READ (all / one)
app.get('/users', (req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY id').all());
});
app.get('/users/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

// UPDATE (PUT = full replace)
app.put('/users/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const errors = validateUser(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const info = db
    .prepare('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?')
    .run(str(req.body.name), str(req.body.email).toLowerCase(), req.body.age, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'user not found' });
  res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id));
});

// UPDATE (PATCH = partial)
app.patch('/users/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const errors = validateUser(req.body, true);
  if (errors.length) return res.status(400).json({ errors });
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'user not found' });
  const next = {
    name: req.body.name !== undefined ? str(req.body.name) : existing.name,
    email: req.body.email !== undefined ? str(req.body.email).toLowerCase() : existing.email,
    age: req.body.age !== undefined ? req.body.age : existing.age,
  };
  db.prepare('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?')
    .run(next.name, next.email, next.age, req.params.id);
  res.json(db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id));
});

// DELETE (cascades to the user's notes)
app.delete('/users/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'user not found' });
  res.status(204).end();
});

// ----- Notes (one-to-many child of users) -----
app.post('/users/:id/notes', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  if (!str(req.body.title)) return res.status(400).json({ errors: ['title is required'] });
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(req.params.id))
    return res.status(404).json({ error: 'user not found' });
  const content = typeof req.body.content === 'string' ? req.body.content : '';
  const info = db
    .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
    .run(req.params.id, str(req.body.title), content);
  res.status(201).json(db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid));
});

app.get('/users/:id/notes', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  res.json(db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY id').all(req.params.id));
});

app.get('/notes/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'note not found' });
  res.json(note);
});

app.put('/notes/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  if (!str(req.body.title)) return res.status(400).json({ errors: ['title is required'] });
  const content = typeof req.body.content === 'string' ? req.body.content : '';
  const info = db
    .prepare("UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?")
    .run(str(req.body.title), content, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'note not found' });
  res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id));
});

app.delete('/notes/:id', (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'note not found' });
  res.status(204).end();
});

// ---------- error handling: the DB is the source of truth ----------
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' });
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'email already exists' });
  if (String(err.code).startsWith('SQLITE_CONSTRAINT')) return res.status(400).json({ error: 'constraint violation' });
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

module.exports = app;
