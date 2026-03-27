import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';

import {
  getDbUserFromAuth,
  validateUserAccess,
  validateResumeOwnership,
} from './../utils/authHelper.js';

const router = express.Router();

//creates a resume
router.post('/resumes', requireAuth(), async (req, res) => {
  try {
    const { currResume } = req.body;

    if (!currResume) {
      return res.status(400).json({ message: 'Missing currResume' });
    }

    const dbUser = await getDbUserFromAuth(req, prisma);

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resume = await prisma.resume.create({
      data: {
        name: currResume.name,
        header: currResume.header,
        title: currResume.title,
        email: currResume.email,
        contact: currResume.contact,
        portfolio: currResume.portfolio,
        summary: currResume.summary,
        education: currResume.education,
        eduDesc: currResume.edu_desc,
        eduHonors: currResume.edu_honors,
        eduLocation: currResume.edu_location,
        userId: dbUser.id,

        experiences: {
          create: (currResume.experience || []).map((job, jobIndex) => ({
            role: job.role,
            company: job.company,
            date: job.date,
            order: jobIndex,
            bullets: {
              create: (job.bullets || []).map((bullet, bulletIndex) => ({
                text: bullet,
                order: bulletIndex,
              })),
            },
          })),
        },

        skillGroups: {
          create: (currResume.skills || []).map((group, groupIndex) => ({
            category: group.category,
            order: groupIndex,
            items: {
              create: (group.items || []).map((item, itemIndex) => ({
                name: item,
                order: itemIndex,
              })),
            },
          })),
        },
      },
      include: {
        experiences: {
          include: {
            bullets: true,
          },
          orderBy: { order: 'asc' },
        },
        skillGroups: {
          include: {
            items: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.status(201).json(resume);
  } catch (error) {
    console.error('Error saving resume:', error);
    return res.status(500).json({ message: 'Failed to save resume' });
  }
});

//gets all resumes for user
router.get('/resumes', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        experiences: {
          include: {
            bullets: true,
          },
          orderBy: { order: 'asc' },
        },
        skillGroups: {
          include: {
            items: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.status(200).json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

//PATCH ROUTE FOR RESUMES
router.patch('/:userId/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId, userId } = req.params;
    const dbUser = await getDbUserFromAuth(req, prisma);

    const userAccess = validateUserAccess(dbUser, userId);
    if (!userAccess.ok) {
      return res.status(userAccess.status).json({
        message: userAccess.message,
      });
    }

    const resumeById = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    const ownership = validateResumeOwnership(resumeById, dbUser.id);
    if (!ownership.ok) {
      return res.status(ownership.status).json({
        message: ownership.message,
      });
    }

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        name: req.body.name,
        header: req.body.header,
        title: req.body.title,
        email: req.body.email,
        contact: req.body.contact,
        portfolio: req.body.portfolio,
        summary: req.body.summary,
        education: req.body.education,
        eduDesc: req.body.eduDesc,
        eduHonors: req.body.eduHonors,
        eduLocation: req.body.eduLocation,

        experiences: {
          deleteMany: {},
          create: (req.body.experience || []).map((exp, expIndex) => ({
            company: exp.company,
            role: exp.role,
            date: exp.date,
            order: expIndex,
            bullets: {
              create: (exp.bullets || []).map((bullet, bulletIndex) => ({
                text: bullet,
                order: bulletIndex,
              })),
            },
          })),
        },

        skillGroups: {
          deleteMany: {},
          create: (req.body.skills || []).map((group, groupIndex) => ({
            category: group.category,
            order: groupIndex,
            items: {
              create: (group.items || []).map((item, itemIndex) => ({
                name: item,
                order: itemIndex,
              })),
            },
          })),
        },
      },
      include: {
        experiences: {
          include: {
            bullets: true,
          },
          orderBy: { order: 'asc' },
        },
        skillGroups: {
          include: {
            items: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.status(200).json(updatedResume);
  } catch (error) {
    console.error('PATCH error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//DELETE ROUTE
router.delete('/:userId/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId, userId } = req.params;
    console.log('hit delete route');

    const dbUser = await getDbUserFromAuth(req, prisma);

    const userAccess = validateUserAccess(dbUser, userId);
    if (!userAccess.ok) {
      return res.status(userAccess.status).json({
        message: userAccess.message,
      });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    const ownership = validateResumeOwnership(resume, dbUser.id);
    if (!ownership.ok) {
      return res.status(ownership.status).json({
        message: ownership.message,
      });
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete resume' });
  }
});

export default router;
