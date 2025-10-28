import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBOrderRepository } from '../infrastructure/persistence/dynamodb-order-repository';
import { DynamoDBTenantRepository } from '../infrastructure/persistence/dynamodb-tenant-repository';
import { OrderService } from '../application/services/order-service';
import { OrderStatus, PaymentStatus } from '../domain/entities/order';

console.log('Environment variables:', {
  TENANTS_TABLE: process.env.TENANTS_TABLE,
  ORDERS_TABLE: process.env.ORDERS_TABLE,
});

const orderRepository = new DynamoDBOrderRepository(process.env.ORDERS_TABLE!);
const tenantRepository = new DynamoDBTenantRepository(process.env.TENANTS_TABLE!);
const orderService = new OrderService(orderRepository, tenantRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Order Lambda Event:', JSON.stringify(event, null, 2));

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  try {
    const { httpMethod, pathParameters, body, queryStringParameters } = event;
    const orderId = pathParameters?.orderId;

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
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
        const order = await orderService.createOrder({
          tenantId: createData.tenantId,
          customerId: createData.customerId,
          items: createData.items,
          currency: createData.currency || 'USD',
          shippingAddress: createData.shippingAddress,
          billingAddress: createData.billingAddress,
          notes: createData.notes,
        });

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(order),
        };

      case 'GET':
        if (orderId) {
          const order = await orderService.getOrder(orderId);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order),
          };
        } else {
          const tenantId = queryStringParameters?.tenantId;
          const status = queryStringParameters?.status;
          const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : undefined;
          const lastEvaluatedKey = queryStringParameters?.lastEvaluatedKey;

          let result;
          if (tenantId) {
            result = await orderService.getOrdersByTenant(tenantId, limit, lastEvaluatedKey);
          } else if (status) {
            result = await orderService.getOrdersByStatus(status, limit, lastEvaluatedKey);
          } else {
            result = await orderService.listOrders(limit, lastEvaluatedKey);
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              items: result.orders,
              lastEvaluatedKey: result.lastEvaluatedKey,
              count: result.orders.length,
            }),
          };
        }

      case 'PUT':
        if (!orderId || !body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Order ID and request body are required' }),
          };
        }

        const updateData = JSON.parse(body);
        const updatedOrder = await orderService.updateOrder({
          orderId,
          status: updateData.status,
          paymentStatus: updateData.paymentStatus,
          notes: updateData.notes,
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedOrder),
        };

      case 'DELETE':
        if (!orderId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Order ID is required' }),
          };
        }

        await orderService.deleteOrder(orderId);
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
