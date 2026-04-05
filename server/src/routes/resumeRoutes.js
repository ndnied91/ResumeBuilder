import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

import multer from 'multer';
import {
  getDbUserFromAuth,
  validateUserAccess,
  validateResumeOwnership,
} from './../utils/authHelper.js';
import { saveJobApplication } from '../../services/jobApplicationService.js';
import { parsePDFResumeWithAI } from '../../services/aiService.js';

const router = express.Router();
const upload = multer();

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
        targetCompany: currResume.targetCompany,
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

    const savedApplication = await saveJobApplication({
      userId: dbUser.id,
      resumeId: resume.id,
      company: resume.targetCompany,
      jobTitle: 'Software Engineer',
      jobLink: currResume.jobLink,
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

    const formattedResumes = resumes.map((resume) => ({
      ...resume,
      resumeId: resume.id,
    }));

    return res.status(200).json(formattedResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

//PATCH ROUTE FOR RESUMES
router.patch('/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId } = req.params;

    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({
        message: 'Authenticated user was not found in the database',
      });
    }

    const resumeById = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resumeById) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

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
        targetCompany: req.body.targetCompany,
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

//DELETE ROUTE UPDATED
router.delete('/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId } = req.params;

    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({
        message: 'Authenticated user was not found in the database',
      });
    }

    const resumeById = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resumeById) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    const ownership = validateResumeOwnership(resumeById, dbUser.id);
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

// //DELETE ROUTE
// router.delete('/:userId/resumes/:resumeId', requireAuth(), async (req, res) => {
//   try {
//     const { resumeId, userId } = req.params;

//     const dbUser = await getDbUserFromAuth(req, prisma);

//     const userAccess = validateUserAccess(dbUser, userId);
//     if (!userAccess.ok) {
//       return res.status(userAccess.status).json({
//         message: userAccess.message,
//       });
//     }

//     const resume = await prisma.resume.findUnique({
//       where: { id: resumeId },
//     });

//     const ownership = validateResumeOwnership(resume, dbUser.id);
//     if (!ownership.ok) {
//       return res.status(ownership.status).json({
//         message: ownership.message,
//       });
//     }

//     await prisma.resume.delete({
//       where: { id: resumeId },
//     });

//     return res.status(200).json({ message: 'Resume deleted successfully' });
//   } catch (error) {
//     console.error('Delete error:', error);
//     return res.status(500).json({ message: 'Failed to delete resume' });
//   }
// });

//RESUME UPDATE PATH
router.post(
  '/resumes/upload',
  requireAuth(),
  upload.single('resumeFile'),
  async (req, res) => {
    try {
      const { userId: authUserId } = getAuth(req);

      const file = req.file;
      const { jobLink, title } = req.body;

      const dbUser = await getDbUserFromAuth(req, prisma);

      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Unsupported file type' });
      }

      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      await parser.destroy();

      const resumeText = result.text;

      const aiResume = await parsePDFResumeWithAI({ resumeText });

      const resume = await prisma.resume.create({
        data: {
          name: aiResume.name,
          targetCompany: title, //from user
          header: aiResume.header,
          title: title,
          email: aiResume.email,
          contact: aiResume.contact,
          portfolio: aiResume.portfolio,
          summary: aiResume.summary,
          education: aiResume.education,
          eduDesc: aiResume.edu_desc,
          eduHonors: aiResume.edu_honors,
          eduLocation: aiResume.edu_location,
          userId: dbUser.id,
          jobLink,

          experiences: {
            create: (aiResume.experience || []).map((job, jobIndex) => ({
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
            create: (aiResume.skills || []).map((group, groupIndex) => ({
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

      const formattedResume = {
        ...resume,
        resumeId: resume.id,
      };

      return res.status(201).json(formattedResume);
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
);

export default router;
