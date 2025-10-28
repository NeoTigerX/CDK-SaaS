import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import apiService from '../services/api';
import { Tenant, Order } from '../types';

const TenantDetailsPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tenantData, ordersData] = await Promise.all([
        apiService.getTenant(tenantId!),
        apiService.getOrdersByTenant(tenantId!, 50),
      ]);
      
      setTenant(tenantData);
      setOrders(ordersData.items);
    } catch (err) {
      setError('Failed to load tenant details');
      console.error('Tenant details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'error';
      case 'INACTIVE':
        return 'default';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'default';
      case 'BASIC':
        return 'primary';
      case 'PREMIUM':
        return 'secondary';
      case 'ENTERPRISE':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tenant) {
    return (
      <Box>
        <Alert severity="error">{error || 'Tenant not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mt: 2 }}
        >
          Back to Tenants
        </Button>
      </Box>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {tenant.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tenant Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tenant ID
                  </Typography>
                  <Typography variant="body1">
                    {tenant.tenantId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {tenant.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Plan
                  </Typography>
                  <Chip
                    label={tenant.plan}
                    color={getPlanColor(tenant.plan) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={tenant.status}
                    color={getStatusColor(tenant.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(tenant.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              {tenant.settings && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Settings
                  </Typography>
                  <Grid container spacing={2}>
                    {tenant.settings.maxUsers && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Max Users
                        </Typography>
                        <Typography variant="body1">
                          {tenant.settings.maxUsers}
                        </Typography>
                      </Grid>
                    )}
                    {tenant.settings.customDomain && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Custom Domain
                        </Typography>
                        <Typography variant="body1">
                          {tenant.settings.customDomain}
                        </Typography>
                      </Grid>
                    )}
                    {tenant.settings.features && tenant.settings.features.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Features
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {tenant.settings.features.map((feature, index) => (
                            <Chip
                              key={index}
                              label={feature}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {orders.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${totalRevenue.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              {orders.length === 0 ? (
                <Typography color="text.secondary">
                  No orders found for this tenant.
                </Typography>
              ) : (
                <Box>
                  {orders.slice(0, 5).map((order) => (
                    <Box
                      key={order.orderId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body1">
                          {order.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customerId} • {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body1">
                          ${order.totalAmount.toFixed(2)}
                        </Typography>
                        <Chip
                          label={order.status}
                          size="small"
                          color={order.status === 'DELIVERED' ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                  ))}
                  {orders.length > 5 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      And {orders.length - 5} more orders...
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDetailsPage;
