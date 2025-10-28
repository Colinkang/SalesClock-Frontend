# API Routes Implementation Guide

## Overview
This document lists the API routes that need to be implemented to complete the migration from Supabase to Express + Prisma.

## Routes to Implement

### 1. ✅ Auth Routes (`src/routes/auth.ts`)
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

### 2. Customers Routes (`src/routes/customers.ts`)
- GET /api/customers
- GET /api/customers/:id
- POST /api/c4500customers
- PUT /api/customers/:id
- DELETE /api/customers/:id

### 3. Visit Plans Routes (`src/routes/visitPlans.ts`)
- GET /api/visit-plans
- GET /api/visit-plans/:id
- POST /api/visit-plans
- PUT /api/visit-plans/:id
- DELETE /api/visit-plans/:id
- POST /api/visit-plans/:id/check-in

### 4. Visit Reports Routes (`src/routes/visitReports.ts`)
- GET /api/visit-reports
- GET /api/visit-reports/:id
- POST /api/visit-reports
- PUT /api/visit-reports/:id
- DELETE /api/visit-reports/:id

### 5. Articles Routes (`src/routes/articles.ts`)
- GET /api/articles
- GET /api/articles/:id
- POST /api/articles
- PUT /api/articles/:id
- DELETE /api/articles/:id

### 6. Invitations Routes (`src/routes/invitations.ts`)
- GET /api/invitations
- GET /api/invitations/verify/:token
- POST /api/invitations
- DELETE /api/invitations/:id

## Quick Implementation Pattern

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET all
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const items = await prisma.tableName.findMany({
      where: { createdBy: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// POST create
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const item = await prisma.tableName.create({
      data: { ...req.body, createdBy: req.userId! },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// PUT update
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.tableName.updateMany({
      where: { id: req.params.id, createdBy: req.userId! },
      data: req.body,
    });
    const updated = await prisma.tableName.findUnique({
      where: { id: req.params.id },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.tableName.deleteMany({
      where: { id: req.params.id, createdBy: req.userId! },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
```

