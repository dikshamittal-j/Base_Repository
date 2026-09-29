import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

const app = express();
const port = 4000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const users = [
  {
    id: 'demo-customer',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    password: 'Market123!',
  },
];
const sessions = new Map();

function createSession(user) {
  const token = randomUUID();
  sessions.set(token, user.id);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

function getUserFromRequest(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const userId = token && sessions.get(token);
  return users.find((user) => user.id === userId);
}

app.post('/api/auth/signup', (request, response) => {
  const name = request.body.name?.trim();
  const email = request.body.email?.trim().toLowerCase();
  const password = request.body.password;

  if (!name || !email || typeof password !== 'string') {
    return response.status(400).json({ message: 'Please complete every field.' });
  }
  if (password.length < 8) {
    return response.status(400).json({ message: 'Use a password with at least 8 characters.' });
  }
  if (users.some((user) => user.email === email)) {
    return response.status(409).json({ message: 'An account with that email already exists.' });
  }

  const user = { id: randomUUID(), name, email, password };
  users.push(user);
  return response.status(201).json(createSession(user));
});

app.post('/api/auth/login', (request, response) => {
  const email = request.body.email?.trim().toLowerCase();
  const { password } = request.body;
  const user = users.find((candidate) => candidate.email === email && candidate.password === password);

  if (!user) {
    return response.status(401).json({ message: 'That email and password do not match.' });
  }
  return response.json(createSession(user));
});

app.get('/api/auth/me', (request, response) => {
  const user = getUserFromRequest(request);
  if (!user) {
    return response.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
  return response.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (request, response) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token) sessions.delete(token);
  return response.status(204).end();
});

app.listen(port, () => {
  console.log(`Goodform Market API running at http://localhost:${port}`);
});