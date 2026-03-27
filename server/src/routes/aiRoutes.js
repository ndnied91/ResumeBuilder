import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';
import { generateResumeWithAI } from '../../services/aiService.js';

import {
  getDbUserFromAuth,
  validateUserAccess,
  validateResumeOwnership,
} from './../utils/authHelper.js';
import { saveGeneratedResume } from '../../services/resumeService.js';

const router = express.Router();

router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId: authUserId } = getAuth(req);
    const { userId, currResume, jobLink } = req.body;

    const dbUser = await getDbUserFromAuth(req, prisma);

    if (!dbUser || dbUser.clerkId !== authUserId) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    const userAccess = validateUserAccess(dbUser, userId);
    if (!userAccess.ok) {
      return res.status(userAccess.status).json({
        message: userAccess.message,
      });
    }

    const aiResume = await generateResumeWithAI({ currResume, jobLink });
    //call AI
    const savedResume = await saveGeneratedResume(
      aiResume,
      currResume,
      dbUser.id,
    );
    //now save this into the database;
    console.log(savedResume);

    return res.status(201).json(savedResume);
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;
