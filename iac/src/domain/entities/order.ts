export interface Order {
  orderId: string;
  tenantId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export class OrderEntity {
  constructor(
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly currency: string,
    public readonly status: OrderStatus,
    public readonly paymentStatus: PaymentStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly shippingAddress?: Address,
    public readonly billingAddress?: Address,
    public readonly notes?: string
  ) {}

  static create(data: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): OrderEntity {
    const now = new Date().toISOString();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new OrderEntity(
      orderId,
      data.tenantId,
      data.customerId,
      data.items,
      data.totalAmount,
      data.currency,
      data.status,
      data.paymentStatus,
      now,
      now,
      data.shippingAddress,
      data.billingAddress,
      data.notes
    );
  }

  updateStatus(status: OrderStatus): OrderEntity {
    return new OrderEntity(
      this.orderId,
      this.tenantId,
      this.customerId,
      this.items,
      this.totalAmount,
      this.currency,
      status,
      this.paymentStatus,
      this.createdAt,
      new Date().toISOString(),
      this.shippingAddress,
      this.billingAddress,
      this.notes
    );
  }

  updatePaymentStatus(paymentStatus: PaymentStatus): OrderEntity {
    return new OrderEntity(
      this.orderId,
      this.tenantId,
      this.customerId,
      this.items,
      this.totalAmount,
      this.currency,
      this.status,
      paymentStatus,
      this.createdAt,
      new Date().toISOString(),
      this.shippingAddress,
      this.billingAddress,
      this.notes
    );
  }

  calculateTotal(): number {
    return this.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  toJSON(): Order {
    return {
      orderId: this.orderId,
      tenantId: this.tenantId,
      customerId: this.customerId,
      items: this.items,
      totalAmount: this.totalAmount,
      currency: this.currency,
      status: this.status,
      paymentStatus: this.paymentStatus,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
