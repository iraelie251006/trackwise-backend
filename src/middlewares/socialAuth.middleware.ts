import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { UserService } from '../services/userService';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
    }

    const decoded = JWTService.verifyAccessToken(token as string);
    const user = await UserService.getUserById(decoded.sub);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
