import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  invitationToken: z.string().optional(),
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, invitationToken } = registerSchema.parse(req.body);

    if (invitationToken) {
      const invitation = await prisma.invitation.findUnique({
        where: { token: invitationToken },
      });

      if (!invitation) {
        return res.status(400).json({ error: 'Invalid invitation token' });
      }

      if (invitation.acceptedAt) {
        return res.status(400).json({ error: 'Invitation already accepted' });
      }

      if (new Date(invitation.expiresAt) < new Date()) {
        return res.status(400).json({ error: 'Invitation expired' });
      }

      if (invitation.email !== email) {
        return res.status(400).json({ error: 'Email does not match invitation' });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const invitationRole = invitationToken 
      ? (await prisma.invitation.findUnique({ where: { token: invitationToken } }))?.role || 'USER'
      : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: invitationRole,
      },
    });

    if (invitationToken) {
      await prisma.invitation.update({
        where: { token: invitationToken },
        data: { acceptedAt: new Date() },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;

