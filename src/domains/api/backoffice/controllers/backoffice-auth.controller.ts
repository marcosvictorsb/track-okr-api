import { Request, Response } from 'express';
import {
  BackofficeAuthUseCase,
  LoginRequest,
  RefreshTokenRequest
} from '../usecases/backoffice-auth.usecase';
import { BackofficeUserRepository } from '../repository/backoffice-user.repository';
import { BackofficeRequest } from '../../../../middlewares/backoffice-auth.middleware';

export class BackofficeAuthController {
  private authUseCase: BackofficeAuthUseCase;

  constructor() {
    this.authUseCase = new BackofficeAuthUseCase(
      new BackofficeUserRepository()
    );
  }

  /**
   * Login do usuário do backoffice
   * POST /api/backoffice/auth/login
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const loginData: LoginRequest = req.body;

      const result = await this.authUseCase.login(loginData);

      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro no login do backoffice:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Refresh token
   * POST /api/backoffice/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshData: RefreshTokenRequest = req.body;

      const result = await this.authUseCase.refreshToken(refreshData);

      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (error) {
      console.error('Erro no refresh token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Logout do usuário
   * POST /api/backoffice/auth/logout
   */
  async logout(req: BackofficeRequest, res: Response): Promise<Response> {
    try {
      const userId = req.backofficeUser?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const result = await this.authUseCase.logout(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Informações do usuário logado
   * GET /api/backoffice/auth/me
   */
  async me(req: BackofficeRequest, res: Response): Promise<Response> {
    try {
      const userId = req.backofficeUser?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const user = await this.authUseCase.validateUser(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Dados do usuário recuperados com sucesso',
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se token é válido
   * GET /api/backoffice/auth/verify
   */
  async verifyToken(req: BackofficeRequest, res: Response): Promise<Response> {
    try {
      const userId = req.backofficeUser?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          valid: false
        });
      }

      const user = await this.authUseCase.validateUser(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo',
          valid: false
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token válido',
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        valid: false
      });
    }
  }
}
