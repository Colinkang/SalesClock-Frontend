import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/visit-reports
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const reports = await prisma.visitReport.findMany({
      include: {
        customer: true,
        visitPlan: { include: { customer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// GET /api/visit-reports/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const report = await prisma.visitReport.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        visitPlan: { include: { customer: true } },
      },
    });
    if (!report) return res.status(404).json({ error: 'Visit report not found' });
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// POST /api/visit-reports
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const report = await prisma.visitReport.create({
      data: {
        visitPlanId: req.body.visitPlanId,
        customerId: req.body.customerId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        communicationPoints: req.body.communicationPoints || '',
        customerFeedback: req.body.customerFeedback || '',
        followUpTasks: req.body.followUpTasks || '',
        attachments: req.body.attachments || [],
        createdBy: req.userId!,
      },
      include: {
        customer: true,
        visitPlan: { include: { customer: true } },
      },
    });
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// PUT /api/visit-reports/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.visitReport.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: 'Visit report not found' });
    
    const updated = await prisma.visitReport.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        customer: true,
        visitPlan: { include: { customer: true } },
      },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/visit-reports/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.visitReport.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

