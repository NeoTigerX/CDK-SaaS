export interface EnvironmentConfig {
  region: string;
  tenantsTableName: string;
  ordersTableName: string;
  apiGatewayUrl?: string;
  userPoolId?: string;
  userPoolClientId?: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    region: process.env.AWS_REGION || 'us-east-1',
    tenantsTableName: process.env.TENANTS_TABLE || 'tenants',
    ordersTableName: process.env.ORDERS_TABLE || 'orders',
    apiGatewayUrl: process.env.API_GATEWAY_URL,
    userPoolId: process.env.USER_POOL_ID,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
  };
};
