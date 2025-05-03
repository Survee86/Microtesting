import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Личный кабинет
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">Добро пожаловать!</Typography>
          <Typography sx={{ mt: 2 }}>
            Здесь будет информация вашего профиля и инструменты управления.
          </Typography>
        </Paper>
      </Box>
    </div>
  );
};

export default Dashboard;