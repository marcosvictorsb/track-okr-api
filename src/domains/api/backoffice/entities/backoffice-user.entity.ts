export class BackofficeUserEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly role: "admin" | "manager" | "analyst" | "viewer";
  public readonly permissions?: object;
  public readonly is_active: boolean;
  public readonly last_login?: Date | null;
  public readonly last_login_ip?: string | null;
  public readonly created_by?: number | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    email: string;
    role: "admin" | "manager" | "analyst" | "viewer";
    permissions?: object;
    is_active: boolean;
    last_login?: Date | null;
    last_login_ip?: string | null;
    created_by?: number | null;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.role = params.role;
    this.permissions = params.permissions;
    this.is_active = params.is_active;
    this.last_login = params.last_login;
    this.last_login_ip = params.last_login_ip;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  hasPermission(permission: string): boolean {
    if (this.role === "admin") return true;
    if (!this.permissions || typeof this.permissions !== "object") return false;
    const perms = this.permissions as Record<string, boolean>;
    return perms[permission] === true;
  }

  canAccess(resource: string, action: string = "read"): boolean {
    if (this.role === "admin") return true;
    const rolePermissions = {
      manager: {
        subscription_plans: ["read", "create", "update"],
        payments: ["read", "update"],
        users: ["read", "create"],
        stats: ["read"],
        dashboard: ["read"]
      },
      analyst: {
        subscription_plans: ["read"],
        payments: ["read"],
        stats: ["read"],
        dashboard: ["read"]
      },
      viewer: {
        subscription_plans: ["read"],
        payments: ["read"],
        stats: ["read"],
        dashboard: ["read"]
      }
    };
    const userRolePerms = rolePermissions[this.role as keyof typeof rolePermissions];
    if (!userRolePerms || !userRolePerms[resource as keyof typeof userRolePerms]) {
      return false;
    }
    const resourcePerms = userRolePerms[resource as keyof typeof userRolePerms];
    return Array.isArray(resourcePerms) && resourcePerms.includes(action);
  }
}

export class BackofficeUserPublicEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly role: "admin" | "manager" | "analyst" | "viewer";
  public readonly permissions?: object;
  public readonly is_active: boolean;
  public readonly last_login?: Date | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    email: string;
    role: "admin" | "manager" | "analyst" | "viewer";
    permissions?: object;
    is_active: boolean;
    last_login?: Date | null;
    created_at?: Date;
    updated_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.role = params.role;
    this.permissions = params.permissions;
    this.is_active = params.is_active;
    this.last_login = params.last_login;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
  }
}
