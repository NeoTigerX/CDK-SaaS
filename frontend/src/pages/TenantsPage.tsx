import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import {
  Tenant,
  TenantPlan,
  TenantStatus,
  CreateTenantRequest,
  UpdateTenantRequest,
} from '../types';

const TenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: TenantPlan.FREE,
    status: TenantStatus.ACTIVE,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTenants(100);
      setTenants(response.items);
    } catch (err) {
      setError('Failed to load tenants');
      console.error('Tenants error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        name: tenant.name,
        email: tenant.email,
        plan: tenant.plan,
        status: tenant.status,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        name: '',
        email: '',
        plan: TenantPlan.FREE,
        status: TenantStatus.ACTIVE,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
    setFormData({
      name: '',
      email: '',
      plan: TenantPlan.FREE,
      status: TenantStatus.ACTIVE,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingTenant) {
        const updateData: UpdateTenantRequest = {
          name: formData.name,
          plan: formData.plan,
          status: formData.status,
        };
        await apiService.updateTenant(editingTenant.tenantId, updateData);
        setSnackbar({ open: true, message: 'Tenant updated successfully', severity: 'success' });
      } else {
        const createData: CreateTenantRequest = {
          name: formData.name,
          email: formData.email,
          plan: formData.plan,
        };
        await apiService.createTenant(createData);
        setSnackbar({ open: true, message: 'Tenant created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchTenants();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save tenant', severity: 'error' });
      console.error('Save tenant error:', err);
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await apiService.deleteTenant(tenantId);
        setSnackbar({ open: true, message: 'Tenant deleted successfully', severity: 'success' });
        fetchTenants();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to delete tenant', severity: 'error' });
        console.error('Delete tenant error:', err);
      }
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return 'success';
      case TenantStatus.SUSPENDED:
        return 'error';
      case TenantStatus.INACTIVE:
        return 'default';
      case TenantStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.FREE:
        return 'default';
      case TenantPlan.BASIC:
        return 'primary';
      case TenantPlan.PREMIUM:
        return 'secondary';
      case TenantPlan.ENTERPRISE:
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Tenant
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.tenantId}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.plan}
                        color={getPlanColor(tenant.plan) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tenants/${tenant.tenantId}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(tenant)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tenant.tenantId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingTenant}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as TenantPlan })}
                >
                  {Object.values(TenantPlan).map((plan) => (
                    <MenuItem key={plan} value={plan}>
                      {plan}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TenantStatus })}
                >
                  {Object.values(TenantStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTenant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TenantsPage;
