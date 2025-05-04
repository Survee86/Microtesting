import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton,
  Button,
  Snackbar,
  Alert 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: ''
  });
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userResponse, profileResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3001/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setUser({
          ...userResponse.data,
          ...profileResponse.data
        });
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
  }, []);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(user[field]);
  };

// Для обновления данных
const handleSave = async (field) => {
  try {
    const token = localStorage.getItem('token');
    const endpoint = ['firstName', 'lastName', 'email'].includes(field) 
      ? '/api/user' 
      : '/api/profile';
    
    await axios.patch(
      `http://localhost:3001${endpoint}`,
      { [field]: tempValue },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    await fetchUserData();
  } catch (error) {
    console.error('Ошибка обновления:', error);
  }
};

  const handleCancel = () => {
    setEditingField(null);
  };

  const renderField = (label, field) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="subtitle1" sx={{ width: 150 }}>{label}:</Typography>
      {editingField === field ? (
        <>
          <TextField
            size="small"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <IconButton onClick={() => handleSave(field)} color="primary">
            <SaveIcon />
          </IconButton>
          <Button onClick={handleCancel}>Отмена</Button>
        </>
      ) : (
        <>
          <Typography sx={{ flexGrow: 1 }}>{user[field] || 'Не указано'}</Typography>
          <IconButton onClick={() => handleEdit(field)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </Box>
  );

  return (
    <div className="dashboard-page">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Личный кабинет
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Профиль пользователя</Typography>
          
          {renderField('Фамилия', 'lastName')}
          {renderField('Имя', 'firstName')}
          {renderField('Email', 'email')}
          {renderField('Дата рождения', 'birthDate')}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;