import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AvatarUploader } from '../components/AvatarUploader';
import { AuthService } from '../services/auth';
import { ProfileService } from '../services/profile';

// Схема валидации для формы регистрации
const RegistrationSchema = Yup.object().shape({
  email: Yup.string().email('Некорректный email').required('Обязательное поле'),
  password: Yup.string().min(6, 'Минимум 6 символов').required('Обязательное поле'),
  name: Yup.string().required('Обязательное поле'),
  age: Yup.number().min(18, 'Минимальный возраст 18').max(120, 'Максимальный возраст 120'),
});

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (values) => {
        try   {

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

                    // 3. Если есть аватар - сохраняем ссылку
                    if (avatarUrl) {
                      await ProfileService.updateAvatar(authResponse.userId, avatarUrl);
                    }

                    navigate('/dashboard');
              } 
        catch (error) 
              {
                    setServerError('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
                    console.error('Registration error:', error);
              }
  };

  return (
    <div className="registration-container">
      
      <h1>Регистрация</h1>
      
      {serverError && <div className="error-message">{serverError}</div>}

      <Formik
        initialValues={{
          email: '',
          password: '',
          name: '',
          age: '',
          bio: ''
        }}
        validationSchema={RegistrationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label>Email</label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label>Имя</label>
              <Field type="text" name="name" />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label>Возраст</label>
              <Field type="number" name="age" />
              <ErrorMessage name="age" component="div" className="error-message" />
            </div>

            <div className="form-group">
              <label>О себе</label>
              <Field as="textarea" name="bio" />
            </div>

            <div className="form-group">
              <AvatarUploader 
                userId="temp" 
                onUploadSuccess={setAvatarUrl} 
              />
              {avatarUrl && (
                <div>
                  <img 
                    src={avatarUrl} 
                    alt="Preview" 
                    style={{ width: 100, height: 100, borderRadius: '50%' }} 
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};