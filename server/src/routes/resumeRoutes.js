import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { requireAuth } from '@clerk/express';
import { prisma } from '../../lib/prisma.js';
import { getDbUserFromAuth } from './../utils/authHelper.js';
import { saveJobApplication } from '../../services/jobApplicationService.js';
import { parsePDFResumeWithAI } from '../../services/aiService.js';
import {
  createResumeRecord,
  normalizeResumeForSave,
  buildExperiencesCreate,
  buildSkillGroupsCreate,
  RESUME_INCLUDE,
} from '../../services/resumeService.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const router = express.Router();
const upload = multer();

//creates a resume
router.post('/resumes', requireAuth(), async (req, res) => {
  try {
    const { currResume, applied } = req.body;

    if (!currResume) {
      return res.status(400).json({ message: 'Missing currResume' });
    }

    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resume = await createResumeRecord(dbUser.id, currResume, {
      jobLink: currResume.jobLink,
      jobDescription: currResume.jobDescription,
    });

    if (applied) {
      await saveJobApplication({
        userId: dbUser.id,
        resumeId: resume.id,
        company: resume.targetCompany,
        jobTitle: 'Software Engineer',
        jobLink: currResume.jobLink,
      });
    }

    return res.status(201).json(resume);
  } catch (error) {
    console.error('Error saving resume:', error);
    return res.status(500).json({ message: 'Failed to save resume' });
  }
});

//gets all resumes for user
router.get('/resumes', requireAuth(), async (req, res) => {
  try {
    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      include: RESUME_INCLUDE,
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

//updates a resume
router.patch('/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId } = req.params;

    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await prisma.resume.findFirst({
      where: { id: resumeId, userId: dbUser.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const { experience, skills } = normalizeResumeForSave(req.body);

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
          create: buildExperiencesCreate(experience),
        },
        skillGroups: {
          deleteMany: {},
          create: buildSkillGroupsCreate(skills),
        },
      },
      include: RESUME_INCLUDE,
    });

    return res.status(200).json(updatedResume);
  } catch (error) {
    console.error('PATCH error:', error);
    return res.status(500).json({ message: 'Failed to update resume' });
  }
});

//deletes a resume
router.delete('/resumes/:resumeId', requireAuth(), async (req, res) => {
  try {
    const { resumeId } = req.params;

    const dbUser = await getDbUserFromAuth(req, prisma);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { count } = await prisma.resume.deleteMany({
      where: { id: resumeId, userId: dbUser.id },
    });

    if (count === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete resume' });
  }
});

//uploads a PDF resume and parses it with AI
router.post(
  '/resumes/upload',
  requireAuth(),
  upload.single('resumeFile'),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    const parser = new PDFParse({ data: file.buffer });

    try {
      const { jobLink, title } = req.body;

      const dbUser = await getDbUserFromAuth(req, prisma);
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { text: resumeText } = await parser.getText();
      const aiResume = await parsePDFResumeWithAI({ resumeText });

      const resume = await createResumeRecord(
        dbUser.id,
        { ...aiResume, title, targetCompany: title },
        { jobLink },
      );

      return res.status(201).json({ ...resume, resumeId: resume.id });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ message: 'Upload failed' });
    } finally {
      await parser.destroy();
    }
  },
);

export default router;
