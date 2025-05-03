import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Stack, 
  Link as MuiLink 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Добавляем Link
import './Auth.css';



const Auth = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  
  
  
  
  return (
    <div className="auth-page">
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        className="auth-form"
        sx={{
          width: 350,
          p: 3,
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Вход в личный кабинет
        </Typography>
        
        <TextField
          label="Логин"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        
        <TextField
          label="Пароль"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
          >
            Войти
          </Button>
          
          <Button 
            component={Link} // Используем Link как компонент
            to="/register" // Указываем путь
            variant="outlined" 
            fullWidth
            size="large"
          >
            Зарегистрироваться
          </Button>
        </Stack>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink 
            component={Link} // Используем Link для MUI
            to="/forgot-password" 
            variant="body2"
          >
            Забыли пароль?
          </MuiLink>
        </Box>
      </Box>
    </div>
  );
};

export default Auth;