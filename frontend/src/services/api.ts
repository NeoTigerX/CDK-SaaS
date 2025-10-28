import axios, { AxiosInstance } from 'axios';
import {
  Tenant,
  Order,
  PaginatedResponse,
  CreateTenantRequest,
  UpdateTenantRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
} from '../types';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

class ApiService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Single API Gateway URL for both tenant and order endpoints
    this.baseUrl = process.env.REACT_APP_API_GATEWAY_URL || 'https://your-api-gateway-url';

    this.api = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      (config) => {
        const session = this.getCurrentSession();
        if (session) {
          const token = session.getIdToken().getJwtToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  private getCurrentSession(): CognitoUserSession | null {
    // This will be set by the auth context
    return (window as any).cognitoSession || null;
  }

  public setSession(session: CognitoUserSession | null) {
    (window as any).cognitoSession = session;
  }

  // Tenant API methods
  async getTenants(limit?: number, lastEvaluatedKey?: string): Promise<PaginatedResponse<Tenant>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (lastEvaluatedKey) params.append('lastEvaluatedKey', lastEvaluatedKey);

    const response = await this.api.get(`${this.baseUrl}/tenants?${params.toString()}`);
    return response.data;
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const response = await this.api.get(`${this.baseUrl}/tenants/${tenantId}`);
    return response.data;
  }

  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await this.api.post(`${this.baseUrl}/tenants`, data);
    return response.data;
  }

  async updateTenant(tenantId: string, data: UpdateTenantRequest): Promise<Tenant> {
    const response = await this.api.put(`${this.baseUrl}/tenants/${tenantId}`, data);
    return response.data;
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/tenants/${tenantId}`);
  }

  // Order API methods
  async getOrders(limit?: number, lastEvaluatedKey?: string): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (lastEvaluatedKey) params.append('lastEvaluatedKey', lastEvaluatedKey);

    const response = await this.api.get(`${this.baseUrl}/orders?${params.toString()}`);
    return response.data;
  }

  async getOrdersByTenant(tenantId: string, limit?: number, lastEvaluatedKey?: string): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);
    if (limit) params.append('limit', limit.toString());
    if (lastEvaluatedKey) params.append('lastEvaluatedKey', lastEvaluatedKey);

    const response = await this.api.get(`${this.baseUrl}/orders?${params.toString()}`);
    return response.data;
  }

  async getOrdersByStatus(status: string, limit?: number, lastEvaluatedKey?: string): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (lastEvaluatedKey) params.append('lastEvaluatedKey', lastEvaluatedKey);

    const response = await this.api.get(`${this.baseUrl}/orders?${params.toString()}`);
    return response.data;
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.api.get(`${this.baseUrl}/orders/${orderId}`);
    return response.data;
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await this.api.post(`${this.baseUrl}/orders`, data);
    return response.data;
  }

  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await this.api.put(`${this.baseUrl}/orders/${orderId}`, data);
    return response.data;
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/orders/${orderId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get(`${this.baseUrl}/health`);
    return response.data;
  }
}

export default new ApiService();
