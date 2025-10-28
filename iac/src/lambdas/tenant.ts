import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBTenantRepository } from '../infrastructure/persistence/dynamodb-tenant-repository';
import { TenantService } from '../application/services/tenant-service';
import { TenantPlan, TenantStatus } from '../domain/entities/tenant';

console.log('Environment variables:', {
  TENANTS_TABLE: process.env.TENANTS_TABLE,
  ORDERS_TABLE: process.env.ORDERS_TABLE,
});

const tenantRepository = new DynamoDBTenantRepository(process.env.TENANTS_TABLE!);
const tenantService = new TenantService(tenantRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Tenant Lambda Event:', JSON.stringify(event, null, 2));

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  try {
    const { httpMethod, pathParameters, body, queryStringParameters } = event;
    const tenantId = pathParameters?.tenantId;

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Health check endpoint
    if (event.path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
      };
    }

    switch (httpMethod) {
      case 'POST':
        if (!body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Request body is required' }),
          };
        }

        const createData = JSON.parse(body);
        const tenant = await tenantService.createTenant({
          name: createData.name,
          email: createData.email,
          plan: createData.plan || TenantPlan.FREE,
        });

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(tenant),
        };

      case 'GET':
        if (tenantId) {
          const tenant = await tenantService.getTenant(tenantId);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(tenant),
          };
        } else {
          const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : undefined;
          const lastEvaluatedKey = queryStringParameters?.lastEvaluatedKey;
          const result = await tenantService.listTenants(limit, lastEvaluatedKey);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              items: result.tenants,
              lastEvaluatedKey: result.lastEvaluatedKey,
              count: result.tenants.length,
            }),
          };
        }

      case 'PUT':
        if (!tenantId || !body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Tenant ID and request body are required' }),
          };
        }

        const updateData = JSON.parse(body);
        const updatedTenant = await tenantService.updateTenant({
          tenantId,
          name: updateData.name,
          plan: updateData.plan,
          status: updateData.status,
          settings: updateData.settings,
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedTenant),
        };

      case 'DELETE':
        if (!tenantId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Tenant ID is required' }),
          };
        }

        await tenantService.deleteTenant(tenantId);
        return {
          statusCode: 204,
          headers,
          body: '',
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
    };
  }
};
