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
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    firstName: Yup.string().required('Обязательное поле'),
    email: Yup.string()
      .email('Некорректный email')
      .required('Обязательное поле'),
    password: Yup.string()
      .min(6, 'Минимум 6 символов')
      .required('Обязательное поле'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
      .required('Обязательное поле')
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/auth/register',
        {
          firstName: values.firstName,
          email: values.email,
          password: values.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        navigate('/dashboard');
      } else {
        // Обработка ошибок валидации с сервера
        if (response.data.errors) {
          const errors = {};
          response.data.errors.forEach(err => {
            errors[err.path] = err.message;
          });
          setFieldErrors(errors);
        }
        setError(response.data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = err.response?.data?.message || 
                       err.message || 
                       'Ошибка регистрации. Пожалуйста, попробуйте позже.';
      
      // Парсинг ошибок валидации
      if (err.response?.data?.errors) {
        const errors = {};
        err.response.data.errors.forEach(error => {
          errors[error.path] = error.message;
        });
        setFieldErrors(errors);
        errorMessage = 'Пожалуйста, исправьте ошибки в форме';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: handleSubmit
  });

  // Комбинируем ошибки Formik и серверные ошибки
  const getError = (field) => {
    return fieldErrors[field] || 
          (formik.touched[field] && formik.errors[field]);
  };

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
        Регистрация
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Имя"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(getError('firstName'))}
          helperText={getError('firstName')}
          inputProps={{
            autoComplete: "given-name"
          }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(getError('email'))}
          helperText={getError('email')}
          inputProps={{
            autoComplete: "email"
          }}
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
          error={Boolean(getError('password'))}
          helperText={getError('password')}
          inputProps={{
            autoComplete: "new-password"
          }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Подтвердите пароль"
          name="confirmPassword"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(getError('confirmPassword'))}
          helperText={getError('confirmPassword')}
          inputProps={{
            autoComplete: "new-password"
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>

        <Typography variant="body2" align="center">
          Уже есть аккаунт?{' '}
          <Link href="/login" underline="hover">
            Войти
          </Link>
        </Typography>
      </form>
    </Box>
  );
};

export default Register;