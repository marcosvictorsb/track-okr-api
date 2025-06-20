import bcrypt from 'bcryptjs';

export interface IEncryptionService {
  encryptPassword(password: string): string;
  comparePasswords(password1: string, password2: string): boolean;
}

export function EncryptionService<T extends new (...args: any[]) => {}>(
  Base: T
) {
  return class extends Base {
    public bcrypt: typeof bcrypt;

    constructor(...args: any[]) {
      super(...args);
      this.bcrypt = bcrypt;
    }

    public encryptPassword(password: string): string {
      const SALT_ROUNDS = 10;
      const salt = this.bcrypt.genSaltSync(SALT_ROUNDS);
      const hash = this.bcrypt.hashSync(password, salt);

      return hash;
    }

    public comparePasswords(password1: string, password2: string): boolean {
      return this.bcrypt.compareSync(password1, password2);
    }
  };
}
