import express from 'express';
import { prisma } from '../../lib/prisma.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: 'Missing clerkId or email' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId }, { email }],
      },
    });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ message: 'Failed to sync user' });
  }
});

export default router;
