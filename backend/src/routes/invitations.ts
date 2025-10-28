import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireAdmin, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/invitations - Get all invitations (admin only)
router.get('/', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const invitations = await prisma.invitation.findMany({
      include: { invitedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

// GET /api/invitations/verify/:token - Verify invitation token
router.get('/verify/:token', async (req, res, next) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: req.params.token },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid invitation token' });
    }

    if (invitation.acceptedAt) {
      return res.status(400).json({ error: 'Invitation already accepted' });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    res.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/invitations - Create invitation (admin only)
router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const token = uuidv4();
    
    const invitation = await prisma.invitation.create({
      data: {
        email: req.body.email,
        token,
        role: req.body.role || 'USER',
        invitedById: req.userId!,
      },
    });

    res.json({
      ...invitation,
      inviteUrl: `${process.env.FRONTEND_URL}/signup?token=${token}`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/invitations/:id - Delete invitation (admin only)
router.delete('/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    await prisma.invitation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

