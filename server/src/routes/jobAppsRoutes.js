import express from 'express';
import cors from 'cors';
import { requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';
import { saveJobApplication } from '../../services/jobApplicationService.js';

import {
  getDbUserFromAuth,
  validateUserAccess,
  validateResumeOwnership,
} from './../utils/authHelper.js';

const router = express.Router();

router.post('/job-applications', requireAuth(), async (req, res) => {
  try {
    const dbUser = await getDbUserFromAuth(req, prisma);

    console.log('hit add job app route');

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { company, jobTitle, status, jobLink, resumeId } = req.body;

    if (!company || !jobTitle) {
      return res.status(400).json({
        message: 'Company and job title are required',
      });
    }

    const savedApplication = await saveJobApplication({
      userId: dbUser.id,
      resumeId: resumeId || null,
      company,
      jobTitle,
      jobLink: jobLink || null,
      status: status || 'Applied',
    });

    return res.status(201).json(savedApplication);
  } catch (e) {
    console.error('Error saving job application:', e);

    return res.status(500).json({
      message: 'Unable to save',
    });
  }
});

router.get(
  '/users/:userId/job-applications',
  requireAuth(),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { userId: authUserId } = getAuth(req);

      console.log('hit job app route');

      const dbUser = await getDbUserFromAuth(req, prisma);

      if (!dbUser || dbUser.clerkId !== authUserId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const userAccess = validateUserAccess(dbUser, userId);
      if (!userAccess.ok) {
        return res.status(userAccess.status).json({
          message: userAccess.message,
        });
      }

      const applications = await prisma.jobApplication.findMany({
        where: {
          userId: dbUser.id,
        },
        include: {
          resume: true, // optional but useful
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(applications);
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return res.status(500).json({
        message: 'Failed to fetch job applications',
      });
    }
  },
);

router.delete('/job-applications/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.jobApplication.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

//used for updating the job status on job apps
router.patch('/job-applications/:id', requireAuth(), async (req, res) => {
  console.log('hit update route');

  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(req.body);

    const updatedJob = await prisma.jobApplication.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

router.patch('/job-applications/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedJob = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

export default router;
