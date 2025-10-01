require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const BASE = '/api';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'ToDo',
  user: 'todo_user',
  password: 'Passw0rd!',
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,          
    maxAge: 1000 * 60 * 60, 
    sameSite: 'lax'
  },
}));

app.use(express.json());

app.post(`${BASE}/todos`, async (req, res) => {
  try {
    const { title } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const sql = `
      INSERT INTO todo.list (title, completed, time)
      VALUES ($1, false, NOW())
      RETURNING id, title, completed, time
    `;
    const params = [String(title).trim()];
    const result = await pool.query(sql, params);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/todos failed:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      schema: err.schema,
      table: err.table,
      routine: err.routine,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get(`${BASE}/todos`, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, completed, time
       FROM todo.list
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /todos error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch(`${BASE}/todos/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const current = await pool.query(
      `SELECT id, title, completed, time FROM todo.list WHERE id = $1`,
      [id]
    );
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const old = current.rows[0];
    const newTitle = title !== undefined ? String(title) : old.title;
    const newCompleted = completed !== undefined ? Boolean(completed) : old.completed;

    const updated = await pool.query(
      `UPDATE todo.list
       SET title = $1, completed = $2
       WHERE id = $3
       RETURNING id, title, completed, time`,
      [newTitle, newCompleted, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('PATCH /todos/:id error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
app.delete(`${BASE}/todos/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const del = await pool.query(
      `DELETE FROM todo.list WHERE id = $1 RETURNING id`,
      [id]
    );
    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /todos/:id error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ====== Start Server ======
const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
