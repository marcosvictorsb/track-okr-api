import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { logger } from '@configs/logger';

dotenv.config();

export interface UserPayload extends Request {
  user: {
    id: number;
  };
}

export const authMiddleware = (
  request: UserPayload,
  response: Response,
  next: NextFunction
) => {
  try {
    const authHeader = request.header('authorization');
    if (!authHeader)
      return response.status(401).json({ error: 'No token provided' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2)
      return response.status(401).json({ error: 'Invalid token format' });

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme))
      return response.status(401).json({ error: 'Token malformatted' });

    jwt.verify(
      token,
      process.env.JWT_SECRET_SIGN as string,
      (error, decoded) => {
        if (error) return response.status(401).json({ error: 'Invalid token' });

        const payload = decoded as { id: number };
        request.user = { id: payload.id };

        return next();
      }
    );
  } catch (error: unknown) {
    logger.error('Error in auth middleware:', error);
    return response
      .status(500)
      .json({ error: 'Internal server error during token validation' });
  }
};
