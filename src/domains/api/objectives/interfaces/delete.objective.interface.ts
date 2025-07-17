import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from './default.interface';
import { ObjectiveEntity } from '../entity/objective.entity';
import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export interface DeleteObjectiveRequest {
  id: number;
}

export interface DeleteObjectiveResponse {
  success: boolean;
}

export interface IDeleteObjectiveGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}

export interface IDeleteObjectiveController {
  deleteObjective(request: UserPayload, response: Response): Promise<Response>;
}

export interface IDeleteObjectiveGateway {
  findById(id: number): Promise<ObjectiveEntity | null>;
  delete(id: number): Promise<boolean>;
  loggerInfo(message: string, data?: Record<string, unknown>): void;
  loggerError(message: string, data?: Record<string, unknown>): void;
}
