import { OrderEntity, Order, OrderStatus, PaymentStatus, OrderItem } from '../../domain/entities/order';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { TenantRepository } from '../../domain/repositories/tenant-repository';

export interface CreateOrderRequest {
  tenantId: string;
  customerId: string;
  items: OrderItem[];
  currency: string;
  shippingAddress?: any;
  billingAddress?: any;
  notes?: string;
}

export interface UpdateOrderRequest {
  orderId: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private tenantRepository: TenantRepository
  ) {}

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Verify tenant exists
    const tenant = await this.tenantRepository.findById(request.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Calculate total amount
    const totalAmount = request.items.reduce((total, item) => total + item.totalPrice, 0);

    const order = OrderEntity.create({
      tenantId: request.tenantId,
      customerId: request.customerId,
      items: request.items,
      totalAmount,
      currency: request.currency,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      notes: request.notes,
    });

    return await this.orderRepository.create(order);
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async updateOrder(request: UpdateOrderRequest): Promise<Order> {
    const existingOrder = await this.orderRepository.findById(request.orderId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const orderEntity = new OrderEntity(
      existingOrder.orderId,
      existingOrder.tenantId,
      existingOrder.customerId,
      existingOrder.items,
      existingOrder.totalAmount,
      existingOrder.currency,
      existingOrder.status,
      existingOrder.paymentStatus,
      existingOrder.createdAt,
      existingOrder.updatedAt,
      existingOrder.shippingAddress,
      existingOrder.billingAddress,
      existingOrder.notes
    );

    let updatedOrder = orderEntity;
    if (request.status) {
      updatedOrder = updatedOrder.updateStatus(request.status);
    }
    if (request.paymentStatus) {
      updatedOrder = updatedOrder.updatePaymentStatus(request.paymentStatus);
    }

    return await this.orderRepository.update(updatedOrder);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await this.orderRepository.delete(orderId);
  }

  async getOrdersByTenant(tenantId: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    return await this.orderRepository.findByTenantId(tenantId, limit, lastEvaluatedKey);
  }

  async getOrdersByStatus(status: string, limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    return await this.orderRepository.findByStatus(status, limit, lastEvaluatedKey);
  }

  async listOrders(limit?: number, lastEvaluatedKey?: string): Promise<{ orders: Order[]; lastEvaluatedKey?: string }> {
    return await this.orderRepository.list(limit, lastEvaluatedKey);
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      status: OrderStatus.CONFIRMED,
    });
  }

  async processOrder(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      status: OrderStatus.PROCESSING,
    });
  }

  async shipOrder(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      status: OrderStatus.SHIPPED,
    });
  }

  async deliverOrder(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      status: OrderStatus.DELIVERED,
    });
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      status: OrderStatus.CANCELLED,
    });
  }

  async markAsPaid(orderId: string): Promise<Order> {
    return await this.updateOrder({
      orderId,
      paymentStatus: PaymentStatus.PAID,
    });
  }
}
