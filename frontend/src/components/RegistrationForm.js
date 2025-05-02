import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Button, 
  CircularProgress, 
  TextField, 
  Box, 
  Typography,
  Alert 
} from '@mui/material';
import { AuthService } from '../services/auth';
import { ProfileService } from '../services/profile';
import { StorageService } from '../services/storage';
import { AvatarUploader } from './AvatarUploader';

/**
 * Схема валидации для формы регистрации
 */
const RegistrationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Некорректный email')
    .required('Обязательное поле'),
  password: Yup.string()
    .min(6, 'Минимум 6 символов')
    .required('Обязательное поле'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтвердите пароль'),
  name: Yup.string()
    .required('Обязательное поле')
    .max(50, 'Слишком длинное имя'),
  age: Yup.number()
    .typeError('Должно быть числом')
    .min(18, 'Минимальный возраст 18')
    .max(120, 'Максимальный возраст 120'),
  bio: Yup.string()
    .max(500, 'Максимум 500 символов')
});

/**
 * Компонент формы регистрации пользователя
 */
export const RegistrationForm = () => {
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError(null);
      
      // 1. Регистрация пользователя
      const authResponse = await AuthService.register({
        email: values.email,
        password: values.password
      });

      // 2. Сохранение профиля
      await ProfileService.saveProfile(authResponse.userId, {
        name: values.name,
        age: values.age,
        bio: values.bio
      });

      // 3. Загрузка аватарки (если есть)
      if (avatarFile) {
        await StorageService.uploadAvatar(authResponse.userId, avatarFile);
      }

      setSuccessMessage('Регистрация прошла успешно! Перенаправляем...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.message || 'Ошибка при регистрации');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Регистрация
      </Typography>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          age: '',
          bio: ''
        }}
        validationSchema={RegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Аватар (необязательно)
              </Typography>
              <AvatarUploader onUploadSuccess={setAvatarFile} />
            </Box>

            <Box mb={3}>
              <Field
                as={TextField}
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                error={touched.email && !!errors.email}
                helperText={<ErrorMessage name="email" />}
              />
            </Box>

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

            <Box mb={3}>
              <Field
                as={TextField}
                name="confirmPassword"
                label="Подтвердите пароль"
                type="password"
                fullWidth
                variant="outlined"
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={<ErrorMessage name="confirmPassword" />}
              />
            </Box>

            <Box mb={3}>
              <Field
                as={TextField}
                name="name"
                label="Имя"
                fullWidth
                variant="outlined"
                error={touched.name && !!errors.name}
                helperText={<ErrorMessage name="name" />}
              />
            </Box>

            <Box mb={3}>
              <Field
                as={TextField}
                name="age"
                label="Возраст"
                type="number"
                fullWidth
                variant="outlined"
                error={touched.age && !!errors.age}
                helperText={<ErrorMessage name="age" />}
              />
            </Box>

            <Box mb={3}>
              <Field
                as={TextField}
                name="bio"
                label="О себе"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                error={touched.bio && !!errors.bio}
                helperText={<ErrorMessage name="bio" />}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={24} /> : null}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};