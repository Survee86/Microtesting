import React, { useState } from 'react';
import { useFormik } from 'formik'; // Хук для управления формой
import * as Yup from 'yup'; // Библиотека для валидации
import { useNavigate } from 'react-router-dom'; // Хук для навигации
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Link
} from '@mui/material'; // Компоненты Material-UI
import { login } from '../../services/auth'; // Сервис для авторизации

/**
 * Компонент страницы входа в систему
 * @returns {JSX.Element} - Возвращает JSX разметку страницы входа
 */
const LoginPage = () => {
  const navigate = useNavigate(); // Хук для программной навигации
  const [error, setError] = useState(''); // Состояние для ошибок авторизации

  /**
   * Конфигурация формы с использованием Formik
   */
  const formik = useFormik({
    // Начальные значения полей формы
    initialValues: {
      email: '',
      password: ''
    },
    
    // Схема валидации с использованием Yup
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Некорректный email')
        .required('Обязательное поле'),
      password: Yup.string()
        .required('Обязательное поле')
    }),
    
    /**
     * Обработчик отправки формы
     * @param {object} values - Значения полей формы
     * @param {object} helpers - Вспомогательные методы Formik
     */
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Вызов сервиса авторизации
        const response = await login(values);
        
        // Сохранение токенов в localStorage
        localStorage.setItem('token', response.token); // Access token
        localStorage.setItem('refreshToken', response.refreshToken); // Refresh token
        
        // Перенаправление на защищенную страницу
        navigate('/dashboard');
      } catch (err) {
        // Обработка ошибок авторизации
        setError(err.response?.data?.message || 'Ошибка авторизации');
      } finally {
        // Снятие состояния "отправка"
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
      {/* Заголовок формы */}
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Вход в систему
      </Typography>

      {/* Блок для отображения ошибок */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Форма входа */}
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        {/* Поле ввода email */}
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

        {/* Поле ввода пароля */}
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

        {/* Кнопка отправки формы */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Вход...' : 'Войти'}
        </Button>

        {/* Ссылка на страницу регистрации */}
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