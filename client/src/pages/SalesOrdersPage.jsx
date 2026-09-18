import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, TextField, CircularProgress,
  Alert, Pagination, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const statusColors = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'error' };

export default function SalesOrdersPage() {
  const { user } = useSelector((state) => state.auth);
  const canCreate = ['admin', 'sales'].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([{ product: null, quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/sales-orders?page=${page}&limit=10`);
      setOrders(res.data.data.orders);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchDropdowns = async () => {
    const [cRes, pRes] = await Promise.all([
      api.get('/customers?limit=100'),
      api.get('/products?limit=100'),
    ]);
    setCustomers(cRes.data.data.customers);
    setProducts(pRes.data.data.products);
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleOpenDialog = () => {
    fetchDropdowns();
    setSelectedCustomer(null);
    setOrderItems([{ product: null, quantity: 1 }]);
    setNotes('');
    setDialogOpen(true);
  };

  const addItem = () => setOrderItems([...orderItems, { product: null, quantity: 1 }]);
  const removeItem = (i) => setOrderItems(orderItems.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const updated = [...orderItems];
    updated[i][field] = value;
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * (item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return toast.error('Please select a customer');
    if (orderItems.some((i) => !i.product)) return toast.error('Please select all products');
    try {
      setSubmitting(true);
      await api.post('/sales-orders', {
        customer: selectedCustomer._id,
        products: orderItems.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        notes,
      });
      toast.success('Sales order created');
      setDialogOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/sales-orders/${id}`, { status });
      toast.success(`Order ${status}`);
      fetchOrders();
      if (detailOpen) {
        const res = await api.get(`/sales-orders/${id}`);
        setSelectedOrder(res.data.data.order);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleViewDetail = async (order) => {
    const res = await api.get(`/sales-orders/${order._id}`);
    setSelectedOrder(res.data.data.order);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Sales Orders</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            New Order
          </Button>
        )}
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No sales orders found</Typography>
                  </TableCell></TableRow>
                ) : orders.map((o) => (
                  <TableRow key={o._id} hover>
                    <TableCell>{o._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{o.customer?.name}</TableCell>
                    <TableCell>${o.totalPrice?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={o.status} color={statusColors[o.status]} size="small" />
                    </TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleViewDetail(o)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {canCreate && o.status === 'pending' && (
                        <Button size="small" color="success" onClick={() => handleStatusUpdate(o._id, 'confirmed')}>
                          Confirm
                        </Button>
                      )}
                      {canCreate && o.status === 'pending' && (
                        <Button size="small" color="error" onClick={() => handleStatusUpdate(o._id, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}

      {/* Create Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Sales Order</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={customers} getOptionLabel={(o) => o.name}
            value={selectedCustomer} onChange={(_, v) => setSelectedCustomer(v)}
            renderInput={(params) => <TextField {...params} label="Customer" margin="normal" fullWidth />}
          />
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Products</Typography>
          {orderItems.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Autocomplete
                sx={{ flex: 2 }} options={products} getOptionLabel={(p) => `${p.title} (${p.SKU})`}
                value={item.product} onChange={(_, v) => updateItem(i, 'product', v)}
                renderInput={(params) => <TextField {...params} label="Product" size="small" />}
              />
              <TextField
                label="Qty" type="number" size="small" sx={{ width: 80 }}
                value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
              <Typography sx={{ width: 80 }}>
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </Typography>
              {orderItems.length > 1 && (
                <Button size="small" color="error" onClick={() => removeItem(i)}>Remove</Button>
              )}
            </Box>
          ))}
          <Button size="small" onClick={addItem} sx={{ mt: 1 }}>+ Add Product</Button>
          <TextField
            fullWidth label="Notes" multiline rows={2} margin="normal"
            value={notes} onChange={(e) => setNotes(e.target.value)}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total: ${calculateTotal().toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography><strong>Customer:</strong> {selectedOrder.customer?.name}</Typography>
              <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Products:</strong></Typography>
              {selectedOrder.products?.map((item, i) => (
                <Typography key={i} variant="body2">
                  • {item.product?.title} × {item.quantity} @ ${item.unitPrice?.toFixed(2)}
                </Typography>
              ))}
              <Typography sx={{ mt: 2 }} variant="h6">Total: ${selectedOrder.totalPrice?.toFixed(2)}</Typography>
              {selectedOrder.notes && <Typography><strong>Notes:</strong> {selectedOrder.notes}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}