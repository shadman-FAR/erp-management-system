import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress,
  Alert, Pagination, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../api/axios';

export default function GRNPage() {
  const { user } = useSelector((state) => state.auth);
  const canCreate = ['admin', 'purchase', 'inventory'].includes(user?.role);

  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGRNs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/grn?page=${page}&limit=10`);
      setGrns(res.data.data.grns);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load GRNs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchGRNs(); }, [fetchGRNs]);

  const handleOpenDialog = async () => {
    const res = await api.get('/purchase-orders?limit=100');
    const ordered = res.data.data.orders.filter((o) => ['pending', 'ordered'].includes(o.status));
    setPurchaseOrders(ordered);
    setSelectedPO(null);
    setReceivedItems([]);
    setNotes('');
    setDialogOpen(true);
  };

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    if (po) {
      setReceivedItems(po.products.map((item) => ({
        product: item.product._id || item.product,
        productName: item.product.title || 'Product',
        quantity: item.quantity,
      })));
    }
  };

  const handleSubmit = async () => {
    if (!selectedPO) return toast.error('Please select a purchase order');
    try {
      setSubmitting(true);
      await api.post('/grn', {
        purchaseOrder: selectedPO._id,
        receivedProducts: receivedItems.map((i) => ({ product: i.product, quantity: i.quantity })),
        notes,
      });
      toast.success('GRN created and inventory updated');
      setDialogOpen(false);
      fetchGRNs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create GRN');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Goods Receipt Notes (GRN)</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Create GRN
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
                  {['GRN ID', 'Purchase Order', 'Supplier', 'Received Date', 'Received By', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {grns.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No GRNs found</Typography>
                  </TableCell></TableRow>
                ) : grns.map((g) => (
                  <TableRow key={g._id} hover>
                    <TableCell>{g._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{g.purchaseOrder?._id?.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{g.purchaseOrder?.supplier?.name}</TableCell>
                    <TableCell>{new Date(g.receivedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{g.receivedBy?.name}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => { setSelectedGRN(g); setDetailOpen(true); }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
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

      {/* Create GRN Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create GRN</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={purchaseOrders}
            getOptionLabel={(o) => `PO-${o._id.slice(-8).toUpperCase()} — ${o.supplier?.name}`}
            value={selectedPO} onChange={(_, v) => handleSelectPO(v)}
            renderInput={(params) => <TextField {...params} label="Purchase Order" margin="normal" fullWidth />}
          />
          {receivedItems.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Received Products</Typography>
              {receivedItems.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                  <Typography sx={{ flex: 2 }}>{item.productName}</Typography>
                  <TextField
                    label="Received Qty" type="number" size="small" sx={{ width: 130 }}
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...receivedItems];
                      updated[i].quantity = parseInt(e.target.value) || 1;
                      setReceivedItems(updated);
                    }}
                    inputProps={{ min: 1 }}
                  />
                </Box>
              ))}
            </>
          )}
          <TextField fullWidth label="Notes" multiline rows={2} margin="normal"
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Create GRN'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>GRN Details</DialogTitle>
        <DialogContent>
          {selectedGRN && (
            <Box>
              <Typography><strong>GRN ID:</strong> {selectedGRN._id.slice(-8).toUpperCase()}</Typography>
              <Typography><strong>Supplier:</strong> {selectedGRN.purchaseOrder?.supplier?.name}</Typography>
              <Typography><strong>Received By:</strong> {selectedGRN.receivedBy?.name}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedGRN.receivedDate).toLocaleDateString()}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Products Received:</strong></Typography>
              {selectedGRN.receivedProducts?.map((item, i) => (
                <Typography key={i} variant="body2">
                  • {item.product?.title} × {item.quantity}
                </Typography>
              ))}
              {selectedGRN.notes && <Typography sx={{ mt: 1 }}><strong>Notes:</strong> {selectedGRN.notes}</Typography>}
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