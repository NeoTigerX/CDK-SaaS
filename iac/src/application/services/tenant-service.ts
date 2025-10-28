import { TenantEntity, Tenant, TenantPlan, TenantStatus } from '../../domain/entities/tenant';
import { TenantRepository } from '../../domain/repositories/tenant-repository';

export interface CreateTenantRequest {
  name: string;
  email: string;
  plan?: TenantPlan;
}

export interface UpdateTenantRequest {
  tenantId: string;
  name?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  settings?: any;
}

export class TenantService {
  constructor(private tenantRepository: TenantRepository) {}

  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    // Check if tenant with email already exists
    const existingTenant = await this.tenantRepository.findByEmail(request.email);
    if (existingTenant) {
      throw new Error('Tenant with this email already exists');
    }

    const tenant = TenantEntity.create({
      name: request.name,
      email: request.email,
      plan: request.plan || TenantPlan.FREE,
      status: TenantStatus.PENDING,
    });

    return await this.tenantRepository.create(tenant);
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return tenant;
  }

  async updateTenant(request: UpdateTenantRequest): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findById(request.tenantId);
    if (!existingTenant) {
      throw new Error('Tenant not found');
    }

    const tenantEntity = new TenantEntity(
      existingTenant.tenantId,
      existingTenant.name,
      existingTenant.email,
      existingTenant.plan,
      existingTenant.status,
      existingTenant.createdAt,
      existingTenant.updatedAt,
      existingTenant.settings
    );

    const updatedTenant = tenantEntity.update({
      name: request.name,
      plan: request.plan,
      status: request.status,
      settings: request.settings,
    });

    return await this.tenantRepository.update(updatedTenant);
  }

  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    await this.tenantRepository.delete(tenantId);
  }

  async listTenants(limit?: number, lastEvaluatedKey?: string): Promise<{ tenants: Tenant[]; lastEvaluatedKey?: string }> {
    return await this.tenantRepository.list(limit, lastEvaluatedKey);
  }

  async activateTenant(tenantId: string): Promise<Tenant> {
    return await this.updateTenant({
      tenantId,
      status: TenantStatus.ACTIVE,
    });
  }

  async suspendTenant(tenantId: string): Promise<Tenant> {
    return await this.updateTenant({
      tenantId,
      status: TenantStatus.SUSPENDED,
    });
  }
}
