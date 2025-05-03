import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  Stack
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';





const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика регистрации
    navigate('/dashboard');
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        boxShadow: 3,
        borderRadius: 2
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация
      </Typography>
      
      <TextField
        label="Имя"
        fullWidth
        margin="normal"
        required
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        required
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <TextField
        label="Пароль"
        type="password"
        fullWidth
        margin="normal"
        required
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" size="large">
          Зарегистрироваться
        </Button>
        
        <Button 
          component={Link}
          to="/auth"
          variant="outlined" 
          size="large"
        >
          Уже есть аккаунт? Войти
        </Button>
      </Stack>
    </Box>
  );
};

export default Register;