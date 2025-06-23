import EnvironmentModel from '@domains/common/environments/model/environment.model';
import { NextFunction, Request, Response } from 'express';

export const ValideApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const envType = req.params.env;

  if (!token) return res.status(401).json({ error: 'Missing API Key' });

  const environment = await EnvironmentModel.findOne({
    where: { key: token, type: envType }
  });

  if (!environment) {
    return res.status(403).json({ error: 'token invalid' });
  }

  (req as any).envType;
  next();
};
