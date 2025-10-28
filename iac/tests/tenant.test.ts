import { TenantEntity, TenantPlan, TenantStatus } from '../src/domain/entities/tenant';

describe('TenantEntity', () => {
  it('should create a new tenant entity', () => {
    const tenantData = {
      name: 'Test Tenant',
      email: 'test@example.com',
      plan: TenantPlan.FREE,
      status: TenantStatus.PENDING,
    };

    const tenant = TenantEntity.create(tenantData);

    expect(tenant.tenantId).toBeDefined();
    expect(tenant.name).toBe(tenantData.name);
    expect(tenant.email).toBe(tenantData.email);
    expect(tenant.plan).toBe(tenantData.plan);
    expect(tenant.status).toBe(tenantData.status);
    expect(tenant.createdAt).toBeDefined();
    expect(tenant.updatedAt).toBeDefined();
  });

  it('should update tenant entity', () => {
    const tenant = TenantEntity.create({
      name: 'Test Tenant',
      email: 'test@example.com',
      plan: TenantPlan.FREE,
      status: TenantStatus.PENDING,
    });

    const updatedTenant = tenant.update({
      name: 'Updated Tenant',
      plan: TenantPlan.PREMIUM,
      status: TenantStatus.ACTIVE,
    });

    expect(updatedTenant.name).toBe('Updated Tenant');
    expect(updatedTenant.plan).toBe(TenantPlan.PREMIUM);
    expect(updatedTenant.status).toBe(TenantStatus.ACTIVE);
    expect(updatedTenant.updatedAt).not.toBe(tenant.updatedAt);
  });

  it('should convert to JSON', () => {
    const tenant = TenantEntity.create({
      name: 'Test Tenant',
      email: 'test@example.com',
      plan: TenantPlan.FREE,
      status: TenantStatus.PENDING,
    });

    const json = tenant.toJSON();

    expect(json).toHaveProperty('tenantId');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('email');
    expect(json).toHaveProperty('plan');
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });
});
