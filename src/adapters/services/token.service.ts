import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UserEntity } from '../../domains/api/users/entity/user.entity';
import { FindUserCriteria } from '@domains/api/users/interfaces';
import {
  TOKEN_EXPIRATION_SHORT,
  TOKEN_EXPIRATION_VERY_LONG
} from '@shared/utils/constants';

dotenv.config();

export interface ITokenService {
  signToken(user: UserEntity): string;
}

export function TokenService<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    public signToken(user: Partial<FindUserCriteria>): string {
      const secret = process.env.JWT_SECRET_SIGN as string;
      if (user.rememberMe) {
        const token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {
          expiresIn: TOKEN_EXPIRATION_VERY_LONG
        });
        return token;
      }

      const token = jwt.sign(JSON.parse(JSON.stringify(user)), secret, {
        expiresIn: TOKEN_EXPIRATION_SHORT
      });

      return token;
    }
  };
}
