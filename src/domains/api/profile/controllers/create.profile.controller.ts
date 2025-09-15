import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreateProfileControllerDependencies,
  ICreateProfileController,
  ICreateProfileInteractor,
  InputCreateProfile
} from '../interfaces/create.profile.interface';

interface MulterRequest extends UserPayload {
  file?: Express.Multer.File;
}

export class CreateProfileController implements ICreateProfileController {
  protected interactor: ICreateProfileInteractor;

  constructor(params: CreateProfileControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createProfile(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const multerRequest = request as MulterRequest;
    const { name, position } = request.body;
    const file = multerRequest.file;

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

    const input: InputCreateProfile = {
      name: name,
      position: position && position.length > 0 ? position : undefined,
      file: fileData,
      id_user: request.user.id,
      id_company: request.user.id_company
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
