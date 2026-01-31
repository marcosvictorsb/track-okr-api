import { NextFunction, Request, Response } from 'express';
import {
  BackofficeJWTPayload,
  BackofficeJWTService
} from '../adapters/services/backoffice-jwt.service';
import { BackofficeUserRepository } from '../domains/api/backoffice/repository/backoffice-user.repository';

export interface BackofficeRequest extends Request {
  backofficeUser?: BackofficeJWTPayload;
}

export interface BackofficeAuthOptions {
  requiredRole?: 'admin' | 'manager' | 'analyst' | 'viewer';
  requiredPermission?: string;
  allowInactive?: boolean;
}

export class BackofficeAuthMiddleware {
  private static userRepository = new BackofficeUserRepository();

  static authenticate(options: BackofficeAuthOptions = {}) {
    return async (
      req: BackofficeRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const authHeader = req.headers.authorization;
        const token = BackofficeJWTService.extractTokenFromHeader(authHeader);

        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Token de acesso obrigatório',
            code: 'MISSING_TOKEN'
          });
        }

        const payload = BackofficeJWTService.verifyAccessToken(token);
        if (!payload) {
          return res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado',
            code: 'INVALID_TOKEN'
          });
        }

        const user = await this.userRepository.findById(payload.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          });
        }

        if (!options.allowInactive && !user.is_active) {
          return res.status(401).json({
            success: false,
            message: 'Usuário inativo',
            code: 'USER_INACTIVE'
          });
        }

        if (
          options.requiredRole &&
          !this.hasRequiredRole(user.role, options.requiredRole)
        ) {
          return res.status(403).json({
            success: false,
            message: 'Permissão insuficiente para esta operação',
            code: 'INSUFFICIENT_ROLE'
          });
        }

        if (
          options.requiredPermission &&
          !user.hasPermission!(options.requiredPermission)
        ) {
          return res.status(403).json({
            success: false,
            message: 'Permissão específica necessária não encontrada',
            code: 'MISSING_PERMISSION'
          });
        }

        req.backofficeUser = {
          ...payload,
          role: user.role,
          permissions: user.permissions
        };

        next();
      } catch (error) {
        console.error('Erro na autenticação do backoffice:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  static requireAdmin() {
    return this.authenticate({ requiredRole: 'admin' });
  }

  static requireManager() {
    return this.authenticate({ requiredRole: 'manager' });
  }

  static requireAnalyst() {
    return this.authenticate({ requiredRole: 'analyst' });
  }

  static requireAuth() {
    return this.authenticate();
  }

  static requirePermission(permission: string) {
    return this.authenticate({ requiredPermission: permission });
  }

  private static hasRequiredRole(
    userRole: string,
    requiredRole: string
  ): boolean {
    const roleHierarchy = {
      admin: 4,
      manager: 3,
      analyst: 2,
      viewer: 1
    };

    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  static optional() {
    return async (
      req: BackofficeRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const authHeader = req.headers.authorization;
        const token = BackofficeJWTService.extractTokenFromHeader(authHeader);

        if (token) {
          const payload = BackofficeJWTService.verifyAccessToken(token);
          if (payload) {
            const user = await this.userRepository.findById(payload.id);
            if (user && user.is_active) {
              req.backofficeUser = {
                ...payload,
                role: user.role,
                permissions: user.permissions
              };
            }
          }
        }

        next();
      } catch {
        next();
      }
    };
  }
}

export const backofficeAuth = BackofficeAuthMiddleware.requireAuth();
export const backofficeAdmin = BackofficeAuthMiddleware.requireAdmin();
export const backofficeManager = BackofficeAuthMiddleware.requireManager();
export const backofficeAnalyst = BackofficeAuthMiddleware.requireAnalyst();
