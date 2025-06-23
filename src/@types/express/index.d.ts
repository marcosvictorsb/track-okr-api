import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      uuid?: string;
      envType?: string;
      user: {
        id: number;
      };
    }
  }
}

export {}; // Isso é importante para transformar o arquivo em um módulo
