import { BackofficeUserEntity } from '@domains/api/backoffice/entities/backoffice-user.entity';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
  private static readonly JWT_SECRET: string = process.env
    .BACKOFFICE_JWT_SECRET as string;
  private static readonly REFRESH_TOKEN_SECRET: string = process.env
    .BACKOFFICE_REFRESH_SECRET as string;

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

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1];
  }

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

  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = decoded.exp - now;

      return timeUntilExpiration < 3600;
    } catch {
      return true;
    }
  }
}
