import { OrderEntity, OrderStatus, PaymentStatus } from '../src/domain/entities/order';

describe('OrderEntity', () => {
  const mockOrderData = {
    tenantId: 'tenant_123',
    customerId: 'customer_456',
    items: [
      {
        productId: 'product_1',
        name: 'Test Product',
        quantity: 2,
        unitPrice: 10.00,
        totalPrice: 20.00,
      },
    ],
    totalAmount: 20.00,
    currency: 'USD',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
  };

  it('should create a new order entity', () => {
    const order = OrderEntity.create(mockOrderData);

    expect(order.orderId).toBeDefined();
    expect(order.tenantId).toBe(mockOrderData.tenantId);
    expect(order.customerId).toBe(mockOrderData.customerId);
    expect(order.items).toEqual(mockOrderData.items);
    expect(order.totalAmount).toBe(mockOrderData.totalAmount);
    expect(order.currency).toBe(mockOrderData.currency);
    expect(order.status).toBe(mockOrderData.status);
    expect(order.paymentStatus).toBe(mockOrderData.paymentStatus);
    expect(order.createdAt).toBeDefined();
    expect(order.updatedAt).toBeDefined();
  });

  it('should update order status', () => {
    const order = OrderEntity.create(mockOrderData);
    const updatedOrder = order.updateStatus(OrderStatus.CONFIRMED);

    expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
    expect(updatedOrder.updatedAt).not.toBe(order.updatedAt);
  });

  it('should update payment status', () => {
    const order = OrderEntity.create(mockOrderData);
    const updatedOrder = order.updatePaymentStatus(PaymentStatus.PAID);

    expect(updatedOrder.paymentStatus).toBe(PaymentStatus.PAID);
    expect(updatedOrder.updatedAt).not.toBe(order.updatedAt);
  });

  it('should calculate total correctly', () => {
    const order = OrderEntity.create(mockOrderData);
    const calculatedTotal = order.calculateTotal();

    expect(calculatedTotal).toBe(20.00);
  });

  it('should convert to JSON', () => {
    const order = OrderEntity.create(mockOrderData);
    const json = order.toJSON();

    expect(json).toHaveProperty('orderId');
    expect(json).toHaveProperty('tenantId');
    expect(json).toHaveProperty('customerId');
    expect(json).toHaveProperty('items');
    expect(json).toHaveProperty('totalAmount');
    expect(json).toHaveProperty('currency');
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('paymentStatus');
    expect(json).toHaveProperty('createdAt');
    expect(json).toHaveProperty('updatedAt');
  });
});
