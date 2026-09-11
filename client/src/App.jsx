import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import api from './api/axios';

function TempHome() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setHealth(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Backend not reachable');
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ERP Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          MERN Stack — Phase 1 Foundation
        </Typography>
        {loading && <CircularProgress sx={{ mt: 2 }} />}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            ❌ {error}
          </Typography>
        )}
        {health && (
          <Box sx={{ mt: 2 }}>
            <Typography color="success.main">✅ Backend connected</Typography>
            <Typography variant="body2" color="text.secondary">
              {health.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {health.timestamp}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<TempHome />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;