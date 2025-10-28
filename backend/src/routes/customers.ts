import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/customers
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { createdBy: req.userId! },
      include: {
        visitPlans: {
          select: { id: true, plannedDate: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
      include: {
        visitPlans: {
          include: {
            reports: { select: { id: true, startTime: true, endTime: true } },
          },
          orderBy: { plannedDate: 'desc' },
        },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address || '',
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        notes: req.body.notes || '',
        createdBy: req.userId!,
      },
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    if (!existing) return res.status(404).json({ error: 'Customer not found' });
    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
