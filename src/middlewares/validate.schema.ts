import { Request, Response, NextFunction } from 'express';
import { logger } from '@configs/logger';
import { AnyZodObject, ZodError } from 'zod';

export const validateSchema =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Validating request schema');
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
