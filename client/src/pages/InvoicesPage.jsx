import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress,
  Alert, Pagination, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import api from '../api/axios';

const statusColors = { draft: 'warning', sent: 'info', paid: 'success' };

const generatePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(25, 118, 210);
  doc.text('ERP Management System', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', pageWidth / 2, 32, { align: 'center' });

  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 50);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 57);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, 64);

  // Customer
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 78);
  doc.setFontSize(10);
  doc.text(invoice.customer?.name || '', 14, 85);
  doc.text(invoice.customer?.email || '', 14, 92);

  // Table header
  let y = 110;
  doc.setFillColor(25, 118, 210);
  doc.setTextColor(255, 255, 255);
  doc.rect(14, y - 6, 182, 8, 'F');
  doc.text('Product', 16, y);
  doc.text('Qty', 100, y);
  doc.text('Unit Price', 120, y);
  doc.text('Total', 160, y);

  // Table rows
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  y += 10;
  invoice.items?.forEach((item) => {
    doc.text(String(item.product), 16, y);
    doc.text(String(item.quantity), 100, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 120, y);
    doc.text(`$${item.total.toFixed(2)}`, 160, y);
    y += 8;
  });

  // Totals
  y += 5;
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 130, y);
  y += 7;
  doc.text(`Tax: $${invoice.tax.toFixed(2)}`, 130, y);
  y += 7;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 130, y);

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

export default function InvoicesPage() {
  const { user } = useSelector((state) => state.auth);
  const canCreate = ['admin', 'sales'].includes(user?.role);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSO, setSelectedSO] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/invoices?page=${page}&limit=10`);
      setInvoices(res.data.data.invoices);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleOpenDialog = async () => {
    const res = await api.get('/sales-orders?limit=100');
    const confirmed = res.data.data.orders.filter((o) => o.status === 'confirmed');
    setSalesOrders(confirmed);
    setSelectedSO(null);
    setTaxPercent(0);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedSO) return toast.error('Please select a sales order');
    try {
      setSubmitting(true);
      await api.post('/invoices', { salesOrderId: selectedSO._id, taxPercent });
      toast.success('Invoice created');
      setDialogOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (invoice) => {
    const res = await api.get(`/invoices/${invoice._id}`);
    setSelectedInvoice(res.data.data.invoice);
    setDetailOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Invoices</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Create Invoice
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
                  {['Invoice #', 'Customer', 'Subtotal', 'Tax', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>No invoices found</Typography>
                  </TableCell></TableRow>
                ) : invoices.map((inv) => (
                  <TableRow key={inv._id} hover>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.customer?.name}</TableCell>
                    <TableCell>${inv.subtotal?.toFixed(2)}</TableCell>
                    <TableCell>${inv.tax?.toFixed(2)}</TableCell>
                    <TableCell>${inv.total?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={inv.status} color={statusColors[inv.status]} size="small" />
                    </TableCell>
                    <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleViewDetail(inv)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="success" onClick={async () => {
                        const res = await api.get(`/invoices/${inv._id}`);
                        generatePDF(res.data.data.invoice);
                      }}>
                        <DownloadIcon fontSize="small" />
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

      {/* Create Invoice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={salesOrders}
            getOptionLabel={(o) => `SO-${o._id.slice(-8).toUpperCase()} — ${o.customer?.name} ($${o.totalPrice?.toFixed(2)})`}
            value={selectedSO} onChange={(_, v) => setSelectedSO(v)}
            renderInput={(params) => <TextField {...params} label="Confirmed Sales Order" margin="normal" fullWidth />}
          />
          <TextField
            fullWidth label="Tax %" type="number" margin="normal"
            value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100 }}
          />
          {selectedSO && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">Subtotal: ${selectedSO.totalPrice?.toFixed(2)}</Typography>
              <Typography variant="body2">Tax ({taxPercent}%): ${(selectedSO.totalPrice * taxPercent / 100).toFixed(2)}</Typography>
              <Typography variant="body1" fontWeight={700}>
                Total: ${(selectedSO.totalPrice * (1 + taxPercent / 100)).toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Typography variant="h6">{selectedInvoice.invoiceNumber}</Typography>
              <Typography><strong>Customer:</strong> {selectedInvoice.customer?.name}</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Items:</strong></Typography>
              {selectedInvoice.items?.map((item, i) => (
                <Typography key={i} variant="body2">
                  • {item.product} × {item.quantity} @ ${item.unitPrice?.toFixed(2)} = ${item.total?.toFixed(2)}
                </Typography>
              ))}
              <Box sx={{ mt: 2 }}>
                <Typography>Subtotal: ${selectedInvoice.subtotal?.toFixed(2)}</Typography>
                <Typography>Tax: ${selectedInvoice.tax?.toFixed(2)}</Typography>
                <Typography variant="h6">Total: ${selectedInvoice.total?.toFixed(2)}</Typography>
              </Box>
              <Button
                variant="outlined" startIcon={<DownloadIcon />} sx={{ mt: 2 }}
                onClick={() => generatePDF(selectedInvoice)}
              >
                Download PDF
              </Button>
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