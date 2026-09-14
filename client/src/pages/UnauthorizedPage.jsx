import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6 }}>
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Access Denied
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this page.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}