import { Tenant, TenantEntity } from '../entities/tenant';

export interface TenantRepository {
  create(tenant: TenantEntity): Promise<Tenant>;
  findById(tenantId: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  update(tenant: TenantEntity): Promise<Tenant>;
  delete(tenantId: string): Promise<void>;
  list(limit?: number, lastEvaluatedKey?: string): Promise<{ tenants: Tenant[]; lastEvaluatedKey?: string }>;
}

export interface TenantFilters {
  status?: string;
  plan?: string;
  createdAfter?: string;
  createdBefore?: string;
}
