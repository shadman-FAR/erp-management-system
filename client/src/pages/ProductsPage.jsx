import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Pagination, CircularProgress, Alert, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  SKU: yup.string().required('SKU is required'),
  price: yup.number().positive('Must be positive').required('Price is required'),
  stock: yup.number().min(0, 'Cannot be negative').required('Stock is required'),
  reorderLevel: yup.number().min(0, 'Cannot be negative').required('Reorder level is required'),
});

export default function ProductsPage() {
  const { user } = useSelector((state) => state.auth);
  const canEdit = ['admin', 'purchase'].includes(user?.role);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { stock: 0, reorderLevel: 10 },
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/products?page=${page}&limit=10&search=${search}`);
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleOpenDialog = (product = null) => {
    setEditProduct(product);
    reset(product || { title: '', SKU: '', price: '', stock: 0, reorderLevel: 10 });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditProduct(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, data);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data);
        toast.success('Product created successfully');
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success('Product deleted successfully');
      setConfirmOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Products</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Product
          </Button>
        )}
      </Box>

      <TextField
        placeholder="Search products..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        size="small"
        sx={{ mb: 2, width: 300 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Title', 'SKU', 'Price', 'Stock', 'Reorder Level', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>No products found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p._id} hover>
                      <TableCell>{p.title}</TableCell>
                      <TableCell><Chip label={p.SKU} size="small" /></TableCell>
                      <TableCell>${p.price.toFixed(2)}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{p.reorderLevel}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.stock <= p.reorderLevel ? 'Low Stock' : 'In Stock'}
                          color={p.stock <= p.reorderLevel ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {canEdit && (
                          <>
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(p)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {user?.role === 'admin' && (
                              <IconButton size="small" color="error" onClick={() => handleDeleteClick(p._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }}>
            <TextField fullWidth margin="normal" label="Title" {...register('title')}
              error={!!errors.title} helperText={errors.title?.message} />
            <TextField fullWidth margin="normal" label="SKU" {...register('SKU')}
              error={!!errors.SKU} helperText={errors.SKU?.message} />
            <TextField fullWidth margin="normal" label="Price" type="number" {...register('price')}
              error={!!errors.price} helperText={errors.price?.message} />
            <TextField fullWidth margin="normal" label="Stock" type="number" {...register('stock')}
              error={!!errors.stock} helperText={errors.stock?.message} />
            <TextField fullWidth margin="normal" label="Reorder Level" type="number" {...register('reorderLevel')}
              error={!!errors.reorderLevel} helperText={errors.reorderLevel?.message} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : editProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}