import { BackofficeUserRepository } from '../repository/backoffice-user.repository';
import { BackofficeJWTService } from '../../../../adapters/services/backoffice-jwt.service';
import { BackofficeUserModel } from '../../../../infra/database/models/backoffice-user.model';
import {
  BackofficeUserEntity,
  BackofficeUserPublicEntity
} from '../entities/backoffice-user.entity';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: BackofficeUserPublicEntity;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

export class BackofficeAuthUseCase {
  constructor(private backofficeUserRepository: BackofficeUserRepository) {}

  /**
   * Login do usuário do backoffice
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { email, password } = request;

      // Validar campos obrigatórios
      if (!email || !password) {
        return {
          success: false,
          message: 'Email e senha são obrigatórios'
        };
      }

      // Buscar usuário com senha (precisa do modelo Sequelize)
      const user =
        await this.backofficeUserRepository.findByEmailWithPassword(email);

      console.log(user);

      if (!user) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      // Verificar se usuário está ativo
      if (!user.is_active) {
        return {
          success: false,
          message: 'Usuário inativo. Entre em contato com o administrador.'
        };
      }

      // Verificar senha
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciais inválidas'
        };
      }

      // Atualizar último login
      await this.backofficeUserRepository.updateLastLogin(user.id);

      // Gerar tokens (usar o modelo para o JWT)
      const tokenData = BackofficeJWTService.generateTokenPair(user);

      // Converter user para entidade pública
      const userEntity = new BackofficeUserPublicEntity({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        is_active: user.is_active,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      });

      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          user: userEntity
        }
      };
    } catch (error) {
      console.error('Erro no login do backoffice:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    try {
      const { refresh_token } = request;

      if (!refresh_token) {
        return {
          success: false,
          message: 'Refresh token é obrigatório'
        };
      }

      // Verificar refresh token
      const tokenPayload =
        BackofficeJWTService.verifyRefreshToken(refresh_token);
      if (!tokenPayload) {
        return {
          success: false,
          message: 'Refresh token inválido ou expirado'
        };
      }

      // Buscar usuário (precisa do modelo para gerar JWT)
      const userEntity = await this.backofficeUserRepository.findById(
        tokenPayload.id
      );
      if (!userEntity || !userEntity.is_active) {
        return {
          success: false,
          message: 'Usuário não encontrado ou inativo'
        };
      }

      // Buscar modelo para gerar tokens
      const user = await this.backofficeUserRepository.findByIdModel(
        tokenPayload.id
      );
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      // Gerar novos tokens
      const tokenData = BackofficeJWTService.generateTokenPair(user);

      return {
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in
        }
      };
    } catch (error) {
      console.error('Erro no refresh token:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verificar se usuário tem permissão para ação
   */
  async verifyPermission(
    userId: number,
    requiredRole: string
  ): Promise<boolean> {
    try {
      const user = await this.backofficeUserRepository.findById(userId);
      if (!user || !user.is_active) {
        return false;
      }

      return user.hasPermission!(requiredRole);
    } catch (error) {
      console.error('Erro na verificação de permissão:', error);
      return false;
    }
  }

  /**
   * Logout do usuário (no futuro pode invalidar tokens em blacklist)
   */
  async logout(userId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Por enquanto apenas registra logout
      // No futuro pode implementar blacklist de tokens
      console.log(`Usuário ${userId} fez logout em:`, new Date());

      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verificar se o usuário existe e está ativo (retorna entidade)
   */
  async validateUser(userId: number): Promise<BackofficeUserEntity | null> {
    try {
      const user = await this.backofficeUserRepository.findById(userId);
      if (!user || !user.is_active) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Erro na validação do usuário:', error);
      return null;
    }
  }

  /**
   * Verificar se o usuário existe e está ativo (retorna model para uso interno)
   */
  async validateUserModel(userId: number): Promise<BackofficeUserModel | null> {
    try {
      const user = await this.backofficeUserRepository.findByIdModel(userId);
      if (!user || !user.is_active) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Erro na validação do usuário:', error);
      return null;
    }
  }
}
