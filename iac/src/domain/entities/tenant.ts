export interface Tenant {
  tenantId: string;
  name: string;
  email: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  settings?: TenantSettings;
}

export interface TenantSettings {
  maxUsers?: number;
  features?: string[];
  customDomain?: string;
}

export enum TenantPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export class TenantEntity {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly plan: TenantPlan,
    public readonly status: TenantStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly settings?: TenantSettings
  ) {}

  static create(data: Omit<Tenant, 'tenantId' | 'createdAt' | 'updatedAt'>): TenantEntity {
    const now = new Date().toISOString();
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new TenantEntity(
      tenantId,
      data.name,
      data.email,
      data.plan,
      data.status,
      now,
      now,
      data.settings
    );
  }

  update(data: Partial<Pick<Tenant, 'name' | 'email' | 'plan' | 'status' | 'settings'>>): TenantEntity {
    return new TenantEntity(
      this.tenantId,
      data.name ?? this.name,
      data.email ?? this.email,
      data.plan ?? this.plan,
      data.status ?? this.status,
      this.createdAt,
      new Date().toISOString(),
      data.settings ?? this.settings
    );
  }

  toJSON(): Tenant {
    return {
      tenantId: this.tenantId,
      name: this.name,
      email: this.email,
      plan: this.plan,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      settings: this.settings,
    };
  }
}
