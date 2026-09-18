import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Card, CardContent,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ bgcolor: `${color}20`, p: 1.5, borderRadius: 2 }}>
            {React.cloneElement(icon, { sx: { fontSize: 32, color } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => { setData(res.data.data); setLoading(false); })
      .catch((err) => { setError(err.response?.data?.message || 'Failed to load dashboard'); setLoading(false); });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  const { stats, lowStockProducts, recentSalesOrders, salesStatusBreakdown, purchaseStatusBreakdown, monthlySales } = data;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Welcome back, {user?.name} 👋
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Products" value={stats.totalProducts}
            icon={<InventoryIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Customers" value={stats.totalCustomers}
            icon={<PeopleIcon />} color="#388e3c" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Suppliers" value={stats.totalSuppliers}
            icon={<LocalShippingIcon />} color="#f57c00" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Pending Sales Orders" value={stats.pendingSalesOrders}
            icon={<ShoppingCartIcon />} color="#7b1fa2" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Sales Revenue" value={`$${stats.totalSales.toFixed(2)}`}
            icon={<AttachMoneyIcon />} color="#c62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Low Stock Items" value={stats.lowStockCount}
            icon={<WarningIcon />} color="#e65100"
            subtitle="Need restocking" />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Monthly Sales Revenue</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#1976d2" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales Order Status Pie */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sales Order Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesStatusBreakdown} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" nameKey="name" label={({ name, value }) => value > 0 ? name : ''}>
                  {salesStatusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Orders Line Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Monthly Order Count</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#388e3c" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Purchase Order Status */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Purchase Order Status</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={purchaseStatusBreakdown} cx="50%" cy="50%" outerRadius={70}
                  dataKey="value" nameKey="name" label={({ name, value }) => value > 0 ? name : ''}>
                  {purchaseStatusBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Low Stock */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              ⚠️ Low Stock Products
            </Typography>
            {lowStockProducts.length === 0 ? (
              <Typography color="text.secondary">All products are well stocked</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Reorder At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.title}</TableCell>
                        <TableCell>{p.SKU}</TableCell>
                        <TableCell>
                          <Chip label={p.stock} color="error" size="small" />
                        </TableCell>
                        <TableCell>{p.reorderLevel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Recent Sales Orders */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Sales Orders</Typography>
            {recentSalesOrders.length === 0 ? (
              <Typography color="text.secondary">No sales orders yet</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSalesOrders.map((o) => (
                      <TableRow key={o._id}>
                        <TableCell>{o._id.slice(-6).toUpperCase()}</TableCell>
                        <TableCell>{o.customer?.name}</TableCell>
                        <TableCell>${o.totalPrice?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip label={o.status} size="small"
                            color={o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'error' : 'warning'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}