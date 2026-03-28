// services/jobApplicationService.js
import { prisma } from '../lib/prisma.js';

export const saveJobApplication = async ({
  userId,
  resumeId,
  company,
  jobTitle,
  jobLink,
  status = 'Applied',
}) => {
  console.log('resume ID is ', resumeId);
  const application = await prisma.jobApplication.create({
    data: {
      userId,
      resumeId: resumeId || null,
      company,
      jobTitle,
      jobLink: jobLink || null,
      status,
      dateApplied: new Date(),
    },
  });

  return application;
};
