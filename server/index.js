import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routes/auth.js';
import invitesRouter from './routes/invites.js';
import requestsRouter from './routes/requests.js';
import connectionsRouter from './routes/connections.js';
import referralsRouter from './routes/referrals.js';
import thanksRouter from './routes/thanks.js';
import rankingsRouter from './routes/rankings.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/invites', invitesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/thanks', thanksRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/notifications', notificationsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

import { sequelize } from './models/index.js';

sequelize.sync({ alter: true }) // Automatically updates database tables
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });
