import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Order, OrderEntity } from '../../domain/entities/order';
import { OrderRepository } from '../../domain/repositories/order-repository';

export class DynamoDBOrderRepository implements OrderRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'us-east-1') {
    this.tableName = tableName;
    const dynamoClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  async create(order: OrderEntity): Promise<Order> {
    const item = order.toJSON();
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
    return item;
  }

  async findById(orderId: string): Promise<Order | null> {
    console.log('Finding order by ID:', orderId);
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'orderId-index',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: { ':orderId': orderId },
      Limit: 1,
    }));
    return result.Items?.[0] as Order || null;
  }

  async findByTenantId(tenantId: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'tenant-index',
      KeyConditionExpression: 'tenantId = :tenantId',
      ExpressionAttributeValues: {
        ':tenantId': tenantId,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString()) : undefined,
    }));

    return {
      orders: result.Items as Order[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : undefined,
    };
  }

  async findByStatus(status: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'status-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString()) : undefined,
    }));

    return {
      orders: result.Items as Order[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : undefined,
    };
  }

  async update(order: OrderEntity): Promise<Order> {
    const item = order.toJSON();
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
    return item;
  }

  async delete(orderId: string): Promise<void> {
    // For composite primary key, we need to know the tenantId
    // This is a limitation of the current design - we might need to store tenantId separately
    // or modify the table structure
    throw new Error('Delete operation requires tenantId for composite primary key');
  }

  async list(limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    const result = await this.client.send(new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString()) : undefined,
    }));

    return {
      orders: result.Items as Order[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : undefined,
    };
  }
}
