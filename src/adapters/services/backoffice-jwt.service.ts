import jwt, { JwtPayload } from 'jsonwebtoken';
import { BackofficeUserModel } from '@domains/api/backoffice/models/backoffice-user.model';
import { BackofficeUserEntity } from '@domains/api/backoffice/entities/backoffice-user.entity';

export interface BackofficeJWTPayload extends JwtPayload {
  id: number;
  email: string;
  role: string;
  permissions?: object;
}

export interface RefreshTokenPayload extends JwtPayload {
  id: number;
  email: string;
  tokenType: string;
}

export class BackofficeJWTService {
  private static readonly JWT_SECRET: string =
    (process.env.BACKOFFICE_JWT_SECRET as string) ||
    'backoffice_secret_key_2025';
  private static readonly JWT_EXPIRES_IN: string =
    (process.env.BACKOFFICE_JWT_EXPIRES_IN as string) || '8h';
  private static readonly REFRESH_TOKEN_SECRET: string =
    (process.env.BACKOFFICE_REFRESH_SECRET as string) ||
    'backoffice_refresh_secret_2025';
  private static readonly REFRESH_EXPIRES_IN: string = '7d';

  /**
   * Gera token de acesso JWT
   */
  static generateAccessToken(user: BackofficeUserEntity): string {
    const payload: Omit<
      BackofficeJWTPayload,
      'iat' | 'exp' | 'aud' | 'iss' | 'sub'
    > = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: 28800 // 8 horas em segundos
    });
  }

  /**
   * Gera refresh token
   */
  static generateRefreshToken(user: BackofficeUserEntity): string {
    const payload: Omit<
      RefreshTokenPayload,
      'iat' | 'exp' | 'aud' | 'iss' | 'sub'
    > = {
      id: user.id,
      email: user.email,
      tokenType: 'refresh'
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: 604800 // 7 dias em segundos
    });
  }

  /**
   * Verifica e decodifica token de acesso
   */
  static verifyAccessToken(token: string): BackofficeJWTPayload | null {
    try {
      const decoded = jwt.verify(
        token,
        this.JWT_SECRET
      ) as BackofficeJWTPayload;

      return decoded;
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      return null;
    }
  }

  /**
   * Verifica refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(
        token,
        this.REFRESH_TOKEN_SECRET
      ) as RefreshTokenPayload;
    } catch (error) {
      console.error('Erro na verificação do refresh token:', error);
      return null;
    }
  }

  /**
   * Gera par de tokens (access + refresh)
   */
  static generateTokenPair(user: BackofficeUserEntity) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 28800, // 8 horas
      user: user
    };
  }

  /**
   * Extrai token do header Authorization
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }

  /**
   * Converte string de expiração para segundos
   */
  private static parseExpirationTime(expiresIn: string): number {
    const timeMap: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 28800; // 8h padrão

    const [, value, unit] = match;
    return parseInt(value) * timeMap[unit];
  }

  /**
   * Verifica se o token está próximo do vencimento (menos de 1 hora)
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - now;

      // Se resta menos de 1 hora (3600 segundos)
      return timeUntilExpiration < 3600;
    } catch {
      return true;
    }
  }
}
