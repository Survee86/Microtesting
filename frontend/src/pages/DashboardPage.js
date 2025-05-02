import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { ProfileService } from '../services/profile';
import { StorageService } from '../services/storage';
import { ProfileForm } from '../components/ProfileForm';
/**
 * Страница личного кабинета пользователя
 */
export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка данных профиля и аватарки
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await ProfileService.getProfile(user.id);
        setProfile(profileData);
        
        const avatar = await StorageService.getAvatarUrl(user.id);
        if (avatar) setAvatarUrl(avatar);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Не удалось загрузить данные профиля');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  /**
   * Обработчик выхода из системы
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Обработчик успешного обновления профиля
   */
  const handleProfileUpdateSuccess = async () => {
    // Перезагружаем данные профиля
    const updatedProfile = await ProfileService.getProfile(user.id);
    setProfile(updatedProfile);
    setEditMode(false);
    
    // Обновляем аватар
    const avatar = await StorageService.getAvatarUrl(user.id);
    if (avatar) setAvatarUrl(avatar);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Личный кабинет</Typography>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Box>

        {!editMode ? (
          <>
            <Box display="flex" alignItems="center" mb={4}>
              <Avatar
                src={avatarUrl || '/default-avatar.png'}
                sx={{ 
                  width: 100, 
                  height: 100,
                  mr: 3
                }}
              />
              <Box>
                <Typography variant="h5">{profile?.name || 'Без имени'}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List>
              <ListItem>
                <ListItemText 
                  primary="Возраст" 
                  secondary={profile?.age || 'Не указан'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="О себе" 
                  secondary={profile?.bio || 'Не заполнено'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Дата регистрации" 
                  secondary={new Date(user?.createdAt).toLocaleDateString()} 
                />
              </ListItem>
            </List>

            <Box mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setEditMode(true)}
              >
                Редактировать профиль
              </Button>
            </Box>
          </>
        ) : (
          <ProfileForm 
            userId={user.id}
            initialValues={{
              name: profile?.name,
              age: profile?.age,
              bio: profile?.bio
            }}
            onSuccess={handleProfileUpdateSuccess}
            onCancel={() => setEditMode(false)}
          />
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Действия
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => navigate('/change-password')}
        >
          Сменить пароль
        </Button>
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => navigate('/delete-account')}
        >
          Удалить аккаунт
        </Button>
      </Paper>
    </Box>
  );
};