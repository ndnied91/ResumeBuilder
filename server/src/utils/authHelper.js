import { getAuth } from '@clerk/express';

export const getDbUserFromAuth = async (req, prisma) => {
  const { userId: clerkUserId } = getAuth(req);

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  return dbUser;
};

export const validateUserAccess = (dbUser, routeUserId) => {
  console.log('compare', dbUser.id, routeUserId);
  if (!dbUser) {
    return {
      ok: false,
      status: 404,
      message: 'User not found',
    };
  }

  if (dbUser.id !== routeUserId) {
    return {
      ok: false,
      status: 403,
      message: 'Forbidden',
    };
  }

  return { ok: true };
};

export const validateResumeOwnership = (resume, dbUserId) => {
  if (!resume) {
    return {
      ok: false,
      status: 404,
      message: 'Resume not found',
    };
  }

  if (resume.userId !== dbUserId) {
    return {
      ok: false,
      status: 403,
      message: 'You do not own this resume',
    };
  }

  return { ok: true };
};
