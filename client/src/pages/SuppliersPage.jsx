import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
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
  name: yup.string().required('Name is required'),
  contact: yup.string().required('Contact is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string(),
});

export default function SuppliersPage() {
  const { user } = useSelector((state) => state.auth);
  const canEdit = ['admin', 'purchase'].includes(user?.role);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/suppliers?page=${page}&limit=10&search=${search}`);
      setSuppliers(res.data.data.suppliers);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    reset(item || { name: '', contact: '', email: '', address: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setEditItem(null); reset(); };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editItem) {
        await api.put(`/suppliers/${editItem._id}`, data);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', data);
        toast.success('Supplier created');
      }
      handleCloseDialog();
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/suppliers/${deleteId}`);
      toast.success('Supplier deleted');
      setConfirmOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Suppliers</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Supplier
          </Button>
        )}
      </Box>

      <TextField placeholder="Search suppliers..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        size="small" sx={{ mb: 2, width: 300 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Name', 'Email', 'Contact', 'Address', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No suppliers found</Typography>
                  </TableCell></TableRow>
                ) : suppliers.map((s) => (
                  <TableRow key={s._id} hover>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.contact}</TableCell>
                    <TableCell>{s.address || '-'}</TableCell>
                    <TableCell>
                      {canEdit && (
                        <>
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(s)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {user?.role === 'admin' && (
                            <IconButton size="small" color="error" onClick={() => { setDeleteId(s._id); setConfirmOpen(true); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField fullWidth margin="normal" label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
            <TextField fullWidth margin="normal" label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField fullWidth margin="normal" label="Contact" {...register('contact')} error={!!errors.contact} helperText={errors.contact?.message} />
            <TextField fullWidth margin="normal" label="Address" {...register('address')} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : editItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
        onConfirm={handleDeleteConfirm} onCancel={() => setConfirmOpen(false)} />
    </Box>
  );
}