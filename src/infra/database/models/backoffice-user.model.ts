import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection/mysql';

export interface BackofficeUserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions?: object;
  is_active: boolean;
  last_login?: Date;
  last_login_ip?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface BackofficeUserCreationAttributes {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  permissions?: object;
  is_active?: boolean;
  created_by?: number;
}

export class BackofficeUserModel
  extends Model<BackofficeUserAttributes>
  implements BackofficeUserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: 'admin' | 'manager' | 'analyst' | 'viewer';
  declare permissions?: object;
  declare is_active: boolean;
  declare last_login?: Date;
  declare last_login_ip?: string;
  declare password_reset_token?: string;
  declare password_reset_expires?: Date;
  declare created_by?: number;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date;

  // Método para verificar permissões
  public hasPermission(permission: string): boolean {
    if (this.role === 'admin') return true;

    if (!this.permissions || typeof this.permissions !== 'object') return false;

    const perms = this.permissions as Record<string, boolean>;
    return perms[permission] === true;
  }

  // Método para verificar se pode acessar um recurso
  public canAccess(resource: string, action: string = 'read'): boolean {
    if (this.role === 'admin') return true;

    const rolePermissions = {
      manager: {
        subscription_plans: ['read', 'create', 'update'],
        payments: ['read', 'update'],
        users: ['read', 'create'],
        stats: ['read']
      },
      analyst: {
        subscription_plans: ['read'],
        payments: ['read'],
        stats: ['read']
      },
      viewer: {
        subscription_plans: ['read'],
        payments: ['read'],
        stats: ['read']
      }
    };

    const userRolePerms = rolePermissions[this.role];
    if (!userRolePerms || !userRolePerms[resource]) return false;

    return userRolePerms[resource].includes(action);
  }

  // Método para formatar dados do usuário (sem senha)
  public toSafeObject() {
    const {
      password: _password,
      password_reset_token: _resetToken,
      password_reset_expires: _resetExpires,
      ...safeData
    } = this.toJSON();
    return safeData;
  }

  // Método para retornar apenas os dataValues limpos
  public toPlainObject() {
    return this.dataValues;
  }

  // Método para dados públicos (ainda mais limitado)
  public toPublicObject() {
    const {
      password: _password,
      password_reset_token: _resetToken,
      password_reset_expires: _resetExpires,
      created_by: _createdBy,
      last_login_ip: _lastLoginIp,
      deleted_at: _deletedAt,
      ...publicData
    } = this.toJSON();
    return publicData;
  }
}

BackofficeUserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'analyst', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'backoffice_users',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'backoffice_users',
    timestamps: true,
    paranoid: true, // Soft delete
    underscored: true,
    indexes: [
      {
        fields: ['email'],
        unique: true
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['password_reset_token']
      }
    ],
    defaultScope: {
      attributes: { exclude: ['password', 'password_reset_token'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      withResetToken: {
        attributes: { include: ['password_reset_token'] }
      }
    }
  }
);

// Associações
BackofficeUserModel.belongsTo(BackofficeUserModel, {
  as: 'creator',
  foreignKey: 'created_by'
});
