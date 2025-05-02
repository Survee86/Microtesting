import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, CircularProgress, TextField, Box, Typography } from '@mui/material';
import { StorageService } from '../services/storage';
import { ProfileService } from '../services/profile';
import { AvatarUploader } from './AvatarUploader';

/**
 * Схема валидации для формы профиля
 */
const ProfileSchema = Yup.object().shape({
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
 * Компонент формы профиля пользователя
 */
export const ProfileForm = ({ userId, initialValues, onSuccess }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  // Загрузка данных профиля при монтировании
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        // Загрузка аватарки
        const url = await StorageService.getAvatarUrl(userId);
        if (url) setAvatarUrl(url);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setServerError('Не удалось загрузить профиль');
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError(null);
      
      // 1. Сохранение данных профиля
      await ProfileService.saveProfile(userId, {
        name: values.name,
        age: values.age,
        bio: values.bio
      });

      // 2. Если есть новая аватарка - сохраняем
      if (avatarUrl && typeof avatarUrl !== 'string') {
        await StorageService.uploadAvatar(userId, avatarUrl);
      }

      // Успешный колбэк
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Profile save error:', error);
      setServerError('Ошибка при сохранении профиля');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Профиль пользователя
      </Typography>

      {serverError && (
        <Typography color="error" paragraph>
          {serverError}
        </Typography>
      )}

      <Formik
        initialValues={{
          name: initialValues?.name || '',
          age: initialValues?.age || '',
          bio: initialValues?.bio || ''
        }}
        validationSchema={ProfileSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Аватар
              </Typography>
              <AvatarUploader
                userId={userId}
                onUploadSuccess={setAvatarUrl}
              />
              {avatarUrl && (
                <Box mt={2}>
                  <img 
                    src={avatarUrl} 
                    alt="Аватар" 
                    style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: '50%',
                      objectFit: 'cover' 
                    }} 
                  />
                </Box>
              )}
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
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить профиль'}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

// Пропсы по умолчанию
ProfileForm.defaultProps = {
  initialValues: {
    name: '',
    age: '',
    bio: ''
  }
};