import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { CreateProfileGateway } from '../gateways/create.profile.gateway';
import {
  CreateProfileInteractorDependencies,
  ICreateProfileInteractor,
  InputCreateProfile
} from '../interfaces/create.profile.interface';

export class CreateProfileInteractor implements ICreateProfileInteractor {
  protected gateway: CreateProfileGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: CreateProfileInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputCreateProfile): Promise<HttpResponse> {
    try {
      const { name, position, file, id_user, id_company } = input;

      this.gateway.loggerInfo('Iniciando criação/atualização de perfil', {
        id_user,
        id_company,
        requestTxt: `user_id: ${id_user}, company_id: ${id_company}, has_name: ${!!name}, has_position: ${!!position}, has_file: ${!!file}`
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Validação de usuário e empresa falhou', {
          id_user,
          id_company,
          requestTxt: `Usuário ${id_user} não pertence à empresa ${id_company} ou dados inválidos`
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Verificar se usuário existe
      const user = await this.gateway.findUser(id_user);
      if (!user) {
        return this.presenter.notFound('Usuário não encontrado');
      }

      // Verificar se há perfil existente para deletar avatar antigo
      const existingProfile = await this.gateway.findUserProfile(id_user);
      let oldAvatarPath: string | null = null;

      if (existingProfile && existingProfile.photo_url && file) {
        oldAvatarPath = existingProfile.photo_url;
      }

      // Processar avatar se fornecido
      let avatarPath: string | undefined;
      if (file) {
        this.gateway.loggerInfo('Iniciando processamento de avatar', {
          id_user,
          size: file.size,
          mimetype: file.mimetype,
          requestTxt: `Arquivo: ${file.originalname}, tamanho: ${file.size} bytes, tipo: ${file.mimetype}`
        });
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          this.gateway.loggerInfo('Arquivo excede limite de tamanho', {
            id_user,
            size: file.size,
            requestTxt: `Arquivo ${file.originalname} muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo: 5MB)`
          });
          return this.presenter.badRequest(
            'Arquivo muito grande. Máximo permitido: 5MB'
          );
        }

        this.gateway.loggerInfo('Validando formato do arquivo de imagem', {
          id_user,
          mimetype: file.mimetype,
          requestTxt: `Verificando se ${file.mimetype} está entre os formatos aceitos: JPG, PNG, WebP`
        });

        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          this.gateway.loggerInfo('Formato de arquivo rejeitado', {
            id_user,
            mimetype: file.mimetype,
            requestTxt: `Formato ${file.mimetype} não suportado. Formatos aceitos: JPEG, JPG, PNG, WebP`
          });
          return this.presenter.badRequest(
            'Formato de arquivo não suportado. Use JPG, PNG ou WebP'
          );
        }

        try {
          avatarPath = await this.gateway.processAvatar(
            file.buffer,
            file.originalname,
            id_user
          );
          this.gateway.loggerInfo('Avatar processado e salvo com sucesso', {
            id_user,
            requestTxt: `Novo avatar salvo em: ${avatarPath}. Arquivo original: ${file.originalname}`
          });
        } catch (error) {
          this.gateway.loggerError('Erro ao processar avatar', {
            id_user,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });

          return this.presenter.badRequest(
            `Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          );
        }
      }

      // Atualizar nome do usuário se fornecido
      if (name && name.length > 0) {
        this.gateway.loggerInfo('Atualizando nome do usuário', {
          id_user,
          requestTxt: `Alterando nome para: "${name}"`
        });

        const updatedUser = await this.gateway.updateUserName(id_user, name);
        if (!updatedUser) {
          this.gateway.loggerError('Falha ao atualizar nome do usuário', {
            id_user,
            requestTxt: `Erro ao alterar nome para: "${name}"`
          });
          return this.presenter.badRequest('Erro ao atualizar nome do usuário');
        }

        this.gateway.loggerInfo('Nome do usuário atualizado com sucesso', {
          id_user,
          requestTxt: `Nome alterado para: "${name}"`
        });
      }

      // Criar ou atualizar perfil
      this.gateway.loggerInfo(
        'Preparando dados do perfil para criação/atualização',
        {
          id_user,
          requestTxt: `Dados: photo_url=${!!avatarPath}, position="${position || 'não informado'}"`
        }
      );

      const profileData: {
        id_user: number;
        photo_url?: string;
        position?: string;
      } = {
        id_user
      };

      if (avatarPath !== undefined) {
        profileData.photo_url = avatarPath;
      }

      if (position !== undefined) {
        profileData.position = position.trim() || undefined;
      }

      const profile = await this.gateway.createOrUpdateProfile(profileData);

      // Deletar avatar antigo se um novo foi carregado
      if (oldAvatarPath && avatarPath) {
        try {
          await this.gateway.deleteOldAvatar(oldAvatarPath);
          this.gateway.loggerInfo('Avatar antigo removido com sucesso', {
            id_user,
            requestTxt: `Avatar antigo removido: ${oldAvatarPath}. Novo avatar: ${avatarPath}`
          });
        } catch (error) {
          // Log mas não falha a operação
          this.gateway.loggerInfo(
            'Falha ao remover avatar antigo (operação continua)',
            {
              id_user,
              requestTxt: `Erro ao remover ${oldAvatarPath}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }
          );
        }
      }

      this.gateway.loggerInfo('Perfil criado/atualizado com sucesso', {
        id_user,
        requestTxt: `Perfil finalizado - photo_url: ${profile.photo_url || 'não definida'}, position: ${profile.position || 'não definida'}, user_name: ${profile.user_name}`
      });

      return this.presenter.ok({
        photo_url: profile.photo_url,
        position: profile.position,
        user_name: profile.user_name,
        user_email: profile.user_email
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao criar/atualizar perfil', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao criar/atualizar perfil');
    }
  }
}
