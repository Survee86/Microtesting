// Импорт необходимых библиотек и компонентов
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Хуки для навигации и ссылок
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Библиотека для работы с формами
import * as Yup from 'yup'; // Библиотека для валидации
import {
  // Компоненты Material-UI
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import { useAuth } from '../context/AuthContext'; // Хук для работы с авторизацией
import { AuthService } from '../services/auth'; // Сервис аутентификации

// Схема валидации формы с помощью Yup

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Некорректный email') // Проверка формата email
    .required('Обязательное поле'), // Поле обязательно для заполнения
  password: Yup.string().required('Обязательное поле'), // Поле обязательно для заполнения
});

// Основной компонент страницы входа
export const LoginPage = () => {
  // Хук для программной навигации
  const navigate = useNavigate();

  // Получаем метод login из контекста аутентификации
  const { login } = useAuth();

  // Состояния компонента
  const [error, setError] = useState(null); // Для ошибок
  const [isLoading, setIsLoading] = useState(false); // Для индикатора загрузки

  // Обработчик отправки формы
  const handleSubmit = async (values) => {
    try {
      setIsLoading(true); // Включаем индикатор загрузки
      setError(null); // Сбрасываем ошибки

      // Вызываем сервис аутентификации
      const { token, user } = await AuthService.login({
        email: values.email,
        password: values.password,
      });

      // Вызываем метод login из контекста
      login(token, user);

      // Перенаправляем в личный кабинет после успешного входа
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Показываем пользователю сообщение об ошибке
      setError(
        err.response?.data?.message ||
          'Ошибка входа. Проверьте данные и попробуйте снова.'
      );
    } finally {
      setIsLoading(false); // Выключаем индикатор загрузки
    }
  };

  // Рендер компонента
  return (
    // Контейнер страницы с центрированием
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // На всю высоту экрана
        backgroundColor: '#f5f5f5', // Фоновый цвет
      }}
    >
      {/* Бумажный эффект Material-UI */}

      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
        }}
      >
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

        {/* Форма с использованием Formik */}

        <Formik
          initialValues={{ email: '', password: '' }} // Начальные значения
          validationSchema={LoginSchema} // Схема валидации
          onSubmit={handleSubmit} // Обработчик отправки
        >
          {({ errors, touched }) => (
            <Form>
              {/* Поле для email */}

              <Box mb={3}>
                <Field
                  as={TextField} // Используем TextField из Material-UI
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  error={touched.email && !!errors.email} // Показываем ошибку
                  helperText={<ErrorMessage name="email" />} // Текст ошибки
                />
              </Box>

              {/* Поле для пароля */}
              <Box mb={3}>
                <Field
                  as={TextField}
                  name="password"
                  label="Пароль"
                  type="password"
                  fullWidth
                  variant="outlined"
                  error={touched.password && !!errors.password}
                  helperText={<ErrorMessage name="password" />}
                />
              </Box>

              {/* Кнопка отправки формы */}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading} // Блокируем при загрузке
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ mb: 2 }}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>

              {/* Ссылки для навигации */}

              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography variant="body2">
                    Нет аккаунта?{' '}
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      Зарегистрируйтесь
                    </Link>
                  </Typography>
                </Grid>

                <Grid item>
                  <Typography variant="body2">
                    <Link
                      to="/forgot-password"
                      style={{ textDecoration: 'none' }}
                    >
                      Забыли пароль?
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};
