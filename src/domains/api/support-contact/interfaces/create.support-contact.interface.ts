import { DataLogOutput, DiscordNotificationService } from '@adapters/services';
import { logger } from '@configs/logger';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Request, Response } from 'express';
import { SupportContactEntity } from '../entity';
import {
  CreateSupportContactCriteria,
  ISupportContactRepository
} from '../repository/support-contact.repository.interface';

export type InputCreateSupportContact = {
  user_id?: number | null;
  company_id?: number | null;
  contact_preference: string;
  contact_value: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  name: string;
};

export type CreateSupportContactRequest = {
  name: string;
  contact_preference: string;
  contact_value: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
};

export interface ICreateSupportContactGateway {
  createSupportContact(
    data: CreateSupportContactCriteria
  ): Promise<SupportContactEntity>;
  sendDiscordNotification(supportData: SupportContactEntity): Promise<void>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreateSupportContactGatewayDependencies {
  supportContactRepository: ISupportContactRepository;
  discordNotificationService: DiscordNotificationService;
  logging: typeof logger;
}

export type CreateSupportContactInteractorDependencies = {
  gateway: ICreateSupportContactGateway;
  presenter: IPresenter;
};

export type CreateSupportContactControllerDependencies = {
  interactor: ICreateSupportContactInteractor;
};

export interface ICreateSupportContactInteractor {
  execute(input: InputCreateSupportContact): Promise<HttpResponse>;
}

export interface ICreateSupportContactController {
  create(request: Request, response: Response): Promise<Response>;
}
