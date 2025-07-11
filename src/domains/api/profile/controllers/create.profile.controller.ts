import { Request, Response } from 'express';
import {
  ICreateProfileController,
  ICreateProfileInteractor
} from '../interfaces/create.profile.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { logger } from '@configs/logger';

interface MulterRequest extends Request {
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export class CreateProfileController implements ICreateProfileController {
  private interactor: ICreateProfileInteractor;
  private logging: typeof logger;

  constructor(interactor: ICreateProfileInteractor) {
    this.interactor = interactor;
    this.logging = logger;
  }

  public async createProfile(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const userPayload = request as UserPayload;
      const multerRequest = request as MulterRequest;
      const { name, position } = request.body;
      const file = multerRequest.file;

      this.logging.info('Requisição para criar/atualizar perfil', {
        userId: userPayload.user.id,
        hasFile: !!file,
        hasPosition: !!position
      });

      // Validar parâmetros obrigatórios
      if (!name) {
        response.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
        return;
      }

      // Preparar dados do arquivo se existir
      let fileData;
      if (file) {
        fileData = {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        };
      }

      const result = await this.interactor.execute({
        name,
        position,
        file: fileData,
        userId: userPayload.user.id
      });

      if (result.success) {
        this.logging.info('Perfil criado/atualizado com sucesso', {
          userId: userPayload.user.id
        });

        response.status(200).json(result);
      } else {
        this.logging.warn('Falha ao criar/atualizar perfil', {
          userId: userPayload.user.id,
          message: result.message
        });

        const statusCode = result.message?.includes('não encontrado')
          ? 404
          : 400;
        response.status(statusCode).json(result);
      }
    } catch (error) {
      this.logging.error('Erro no controller de perfil', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
