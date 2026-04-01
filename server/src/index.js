import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';

import resumeRoutes from './routes/resumeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import jobAppsRoutes from './routes/jobAppsRoutes.js';

import atsRoutes from './routes/atsRoutes.js';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
// Clerk middleware should run before protected routes
app.use(clerkMiddleware());

app.use('/api/user', userRoutes);
app.use('/api/users', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/', jobAppsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
