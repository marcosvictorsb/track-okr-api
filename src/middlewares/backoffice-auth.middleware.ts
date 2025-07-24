import { Request, Response, NextFunction } from 'express';
import {
  BackofficeJWTService,
  BackofficeJWTPayload
} from '../adapters/services/backoffice-jwt.service';
import { BackofficeUserRepository } from '../domains/api/backoffice/repository/backoffice-user.repository';

// Estender interface Request para incluir dados do usuário
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

  /**
   * Middleware principal de autenticação
   */
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

        // Verificar token
        const payload = BackofficeJWTService.verifyAccessToken(token);
        if (!payload) {
          return res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado',
            code: 'INVALID_TOKEN'
          });
        }

        // Buscar usuário no banco para verificar se ainda está ativo
        const user = await this.userRepository.findById(payload.id);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          });
        }

        // Verificar se usuário está ativo (exceto se explicitamente permitido)
        if (!options.allowInactive && !user.is_active) {
          return res.status(401).json({
            success: false,
            message: 'Usuário inativo',
            code: 'USER_INACTIVE'
          });
        }

        // Verificar role mínima necessária
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

        // Verificar permissão específica
        if (
          options.requiredPermission &&
          !user.hasPermission(options.requiredPermission)
        ) {
          return res.status(403).json({
            success: false,
            message: 'Permissão específica necessária não encontrada',
            code: 'MISSING_PERMISSION'
          });
        }

        // Anexar dados do usuário à requisição
        req.backofficeUser = {
          ...payload,
          role: user.role, // Usar role atual do banco
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

  /**
   * Middleware apenas para admin
   */
  static requireAdmin() {
    return this.authenticate({ requiredRole: 'admin' });
  }

  /**
   * Middleware para manager ou superior
   */
  static requireManager() {
    return this.authenticate({ requiredRole: 'manager' });
  }

  /**
   * Middleware para analyst ou superior
   */
  static requireAnalyst() {
    return this.authenticate({ requiredRole: 'analyst' });
  }

  /**
   * Middleware básico (qualquer usuário autenticado)
   */
  static requireAuth() {
    return this.authenticate();
  }

  /**
   * Middleware para permissão específica
   */
  static requirePermission(permission: string) {
    return this.authenticate({ requiredPermission: permission });
  }

  /**
   * Verifica se a role do usuário é suficiente
   */
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

  /**
   * Middleware opcional - não retorna erro se não autenticado
   */
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
        // Em caso de erro, apenas continua sem autenticar
        next();
      }
    };
  }
}

// Exports para compatibilidade
export const backofficeAuth = BackofficeAuthMiddleware.requireAuth();
export const backofficeAdmin = BackofficeAuthMiddleware.requireAdmin();
export const backofficeManager = BackofficeAuthMiddleware.requireManager();
export const backofficeAnalyst = BackofficeAuthMiddleware.requireAnalyst();
