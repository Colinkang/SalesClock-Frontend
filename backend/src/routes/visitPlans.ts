import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/visit-plans
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    let where: any = { createdBy: req.userId! };
    
    if (req.query.date) {
      where.plannedDate = new Date(req.query.date as string);
    } else if (req.query.month) {
      const [year, month] = (req.query.month as string).split('-');
      where.plannedDate = {
        gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        lt: new Date(parseInt(year), parseInt(month), 1),
      };
    }

    const plans = await prisma.visitPlan.findMany({
      where,
      include: { customer: true },
      orderBy: { plannedDate: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// GET /api/visit-plans/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const plan = await prisma.visitPlan.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
      include: { customer: true, reports: true },
    });
    if (!plan) return res.status(404).json({ error: 'Visit plan not found' });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// POST /api/visit-plans
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const plan = await prisma.visitPlan.create({
      data: {
        customerId: req.body.customerId,
        plannedDate: new Date(req.body.plannedDate),
        createdBy: req.userId!,
      },
      include: { customer: true },
    });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// PUT /api/visit-plans/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.visitPlan.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    if (!existing) return res.status(404).json({ error: 'Visit plan not found' });
    
    const updated = await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: req.body,
      include: { customer: true },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/visit-plans/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const plan = await prisma.visitPlan.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    if (!plan) return res.status(404).json({ error: 'Visit plan not found' });
    await prisma.visitPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/visit-plans/:id/check-in
router.post('/:id/check-in', async (req: AuthRequest, res, next) => {
  try {
    const plan = await prisma.visitPlan.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    if (!plan) return res.status(404).json({ error: 'Visit plan not found' });
    
    const updated = await prisma.visitPlan.update({
      where: { id: req.params.id },
      data: {
        status: 'CHECKED_IN',
        checkInTime: new Date(),
        checkInLatitude: req.body.latitude,
        checkInLongitude: req.body.longitude,
        checkInPhotoUrl: req.body.photoUrl,
        checkInNotes: req.body.notes,
      },
      include: { customer: true },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;

