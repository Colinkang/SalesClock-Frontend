import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/articles
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// GET /api/articles/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// POST /api/articles
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const article = await prisma.article.create({
      data: {
        title: req.body.title,
        content: req.body.content || '',
        createdBy: req.userId!,
      },
    });
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// PUT /api/articles/:id
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.article.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: 'Article not found' });
    
    const updated = await prisma.article.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

