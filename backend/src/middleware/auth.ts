import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

export const requireManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    if (!['ADMIN', 'MANAGER'].includes(req.userRole || '')) {
      return res.status(403).json({ error: 'Manager access required' });
    }
    next();
  });
};

