import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UserEntity } from '../../domains/api/users/entity/user.entity';

dotenv.config();

export interface ITokenService {
  sign(user: UserEntity): string;
}

export function TokenService<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    public sign(user: Partial<UserEntity>): string {
      const secret = process.env.JWT_SECRET_SIGN as string;
      const expiration = Math.floor(Date.now() / 1000) + 86400;

      const token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {
        expiresIn: 86400
      });

      return token;
    }
  };
}
