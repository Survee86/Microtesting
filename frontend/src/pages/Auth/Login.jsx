import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Link
} from '@mui/material';
import { login } from '../../services/auth'; // Проверьте этот путь

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Некорректный email')
        .required('Обязательное поле'),
      password: Yup.string()
        .required('Обязательное поле')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await login(values);
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка авторизации');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Box sx={{ 
      maxWidth: 400,
      mx: 'auto',
      mt: 8,
      p: 4,
      boxShadow: 3,
      borderRadius: 2
    }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Вход в систему
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Пароль"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={formik.isSubmitting}
        >
          Войти
        </Button>

        <Typography variant="body2" align="center">
          Нет аккаунта?{' '}
          <Link href="/register" underline="hover">
            Зарегистрируйтесь
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;