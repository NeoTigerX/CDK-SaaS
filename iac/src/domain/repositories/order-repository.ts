import { Order, OrderEntity } from '../entities/order';

export interface OrderRepository {
  create(order: OrderEntity): Promise<Order>;
  findById(orderId: string): Promise<Order | null>;
  findByTenantId(tenantId: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }>;
  findByStatus(status: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }>;
  update(order: OrderEntity): Promise<Order>;
  delete(orderId: string): Promise<void>;
  list(limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }>;
}

export interface OrderFilters {
  tenantId?: string;
  status?: string;
  paymentStatus?: string;
  createdAfter?: string;
  createdBefore?: string;
  minAmount?: number;
  maxAmount?: number;
}
