import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import { logout } from '../features/auth/authSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body1" gutterBottom>
            Welcome back, <strong>{user?.name}</strong>!
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Chip label={`Role: ${user?.role}`} color="primary" sx={{ mr: 1 }} />
            <Chip label={user?.email} variant="outlined" />
          </Box>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Full dashboard with charts and metrics coming in Day 6.
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}