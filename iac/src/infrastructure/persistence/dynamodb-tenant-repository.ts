import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Tenant, TenantEntity } from '../../domain/entities/tenant';
import { TenantRepository } from '../../domain/repositories/tenant-repository';

export class DynamoDBTenantRepository implements TenantRepository {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'us-east-1') {
    this.tableName = tableName;
    const dynamoClient = new DynamoDBClient({ region });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
  }

  async create(tenant: TenantEntity): Promise<Tenant> {
    const item = tenant.toJSON();
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
    return item;
  }

  async findById(tenantId: string): Promise<Tenant | null> {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { tenantId },
    }));
    return result.Item as Tenant || null;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }));
    return result.Items?.[0] as Tenant || null;
  }

  async update(tenant: TenantEntity): Promise<Tenant> {
    const item = tenant.toJSON();
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
    return item;
  }

  async delete(tenantId: string): Promise<void> {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { tenantId },
    }));
  }

  async list(limit?: number, lastEvaluatedKey?: string): Promise<{ tenants: Tenant[]; lastEvaluatedKey?: string }> {
    const result = await this.client.send(new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString()) : undefined,
    }));

    return {
      tenants: result.Items as Tenant[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : undefined,
    };
  }
}
