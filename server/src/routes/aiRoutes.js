import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';
import {
  generateResumeWithAI,
  improveResumeWithAI,
} from '../../services/aiService.js';
import { saveJobApplication } from '../../services/jobApplicationService.js';

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
    const { userId, currResume, jobLink, isApplied } = req.body;

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
      jobLink,
    );
    //now save this into the database;

    if (isApplied) {
      await saveJobApplication({
        userId: dbUser.id,
        resumeId: savedResume.id,
        company: savedResume.targetCompany,
        jobTitle: 'Software Engineer',
        jobLink: currResume.jobLink,
      });
    }

    return res.status(201).json(savedResume);
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

router.post('/ats', requireAuth(), async (req, res) => {
  try {
    const { analysisResult, jobLink } = req.body;

    const dbUser = await getDbUserFromAuth(req, prisma);

    const aiResume = await improveResumeWithAI({ analysisResult, jobLink });

    const savedResume = await saveGeneratedResume(
      aiResume,
      analysisResult.resume,
      dbUser.id,
      jobLink,
    );

    return res.status(201).json(savedResume);
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({
      message: 'Server error',
    });
  }
});

export default router;
