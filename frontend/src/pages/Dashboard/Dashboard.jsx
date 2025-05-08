// Импорт необходимых модулей из React и сторонних библиотек
import React, { useState, useEffect } from 'react'; // Базовые хуки React
import { 
  Box, // Контейнер для layout
  Typography, // Текстовые элементы
  Paper, // Карточка с тенями
  TextField, // Поле ввода
  IconButton, // Кнопка с иконкой
  Button, // Обычная кнопка
  Snackbar, // Всплывающее уведомление
  Alert // Компонент alert для Snackbar
} from '@mui/material'; // Компоненты Material-UI
import EditIcon from '@mui/icons-material/Edit'; // Иконка редактирования
import SaveIcon from '@mui/icons-material/Save'; // Иконка сохранения
import axios from 'axios'; // HTTP-клиент для запросов к API
import './Dashboard.css'; // Локальные стили

// Основной компонент Dashboard
const Dashboard = () => {
  // Состояние для хранения данных пользователя
  const [user, setUser] = useState({
    firstName: '', // Имя
    lastName: '', // Фамилия
    birthDate: '', // Дата рождения
    email: '' // Электронная почта
  });

  // Состояние для отслеживания, какое поле сейчас редактируется
  const [editingField, setEditingField] = useState(null);
  // Временное значение при редактировании поля
  const [tempValue, setTempValue] = useState('');
  // Состояние для управления Snackbar (уведомлениями)
  const [snackbar, setSnackbar] = useState({ 
    open: false, // Видимость уведомления
    message: '', // Текст сообщения
    severity: 'success' // Тип уведомления (success/error/info/warning)
  });

  /**
   * Функция для выполнения запросов с автоматическим обновлением токена
   * @param {string} url - URL для запроса
   * @param {object} options - Опции запроса (headers, method и т.д.)
   * @returns {Promise} - Результат запроса
   */
  const fetchWithRefresh = async (url, options = {}) => {
    try {
      // Пытаемся выполнить оригинальный запрос
      return await axios(url, options);
    } catch (error) {
      // Если ошибка связана с просроченным токеном (код TOKEN_EXPIRED)
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          // Получаем refreshToken из localStorage
          const refreshToken = localStorage.getItem('refreshToken');
          
          // Запрашиваем новый access token
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          
          // Сохраняем новый токен
          localStorage.setItem('token', data.token);
          
          // Обновляем заголовок Authorization для повторного запроса
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${data.token}`
            }
          };
          
          // Повторяем оригинальный запрос с новым токеном
          return await axios(url, newOptions);
        } catch (refreshError) {
          // Если не удалось обновить токен - разлогиниваем пользователя
          console.error('Ошибка обновления токена:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setSnackbar({
            open: true,
            message: 'Сессия истекла. Пожалуйста, войдите снова',
            severity: 'error'
          });
          throw refreshError;
        }
      }
      // Для всех других ошибок просто пробрасываем исключение
      throw error;
    }
  };

  // Эффект для загрузки данных пользователя при монтировании компонента
  useEffect(() => {
    /**
     * Асинхронная функция для получения данных пользователя
     * с обработкой обновления токена
     */
    const fetchUserData = async () => {
      try {
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        console.log('[Диагностика] Токен авторизации:', token); // Диагностика

        // Проверяем наличие токена
        if (!token) {
          console.error('[Ошибка] Токен авторизации отсутствует');
          setSnackbar({
            open: true,
            message: 'Требуется авторизация. Пожалуйста, войдите в систему',
            severity: 'error'
          });
          return;
        }
        
        // Конфигурация заголовков для запросов
        const authHeader = { Authorization: `Bearer ${token}` };
        
        // Параллельно выполняем два запроса через fetchWithRefresh:
        const userResponse = await fetchWithRefresh('/api/user', { headers: authHeader });
        const userData = userResponse.data;

        console.log('[Диагностика] Ответ /api/user:', userResponse.data);
        
        // Объединяем полученные данные
        const mergedData = userResponse.data;

        console.log('[Диагностика] Объединенные данные:', mergedData);
        setUser(mergedData);
        
      } catch (error) {
        console.error('[Ошибка]', error.response?.data || error.message);
        
        // Обработка ошибки 403 (Forbidden)
        if (error.response?.status === 403) {
          localStorage.removeItem('token');
          setSnackbar({
            open: true,
            message: 'Сессия истекла. Пожалуйста, войдите снова',
            severity: 'error'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Ошибка загрузки данных',
            severity: 'error'
          });
        }
      }
    };

    // Вызываем функцию загрузки данных
    fetchUserData();
  }, []); // Пустой массив зависимостей = выполняется только при монтировании

  // Обработчик начала редактирования поля
  const handleEdit = (field) => {
    setEditingField(field); // Устанавливаем какое поле редактируется
    setTempValue(user[field]); // Сохраняем текущее значение во временное состояние
  };

  // Обработчик сохранения изменений поля
  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      // Используем fetchWithRefresh вместо прямого вызова axios
      await fetchWithRefresh('/api/user', {
        method: 'PATCH',
        data: { [field]: tempValue },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Обновляем состояние только после успешного запроса
      setUser(prev => ({ ...prev, [field]: tempValue }));
      setSnackbar({ open: true, message: 'Данные сохранены!', severity: 'success' });
      
    } catch (error) {
      console.error('Ошибка сохранения:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || 'Ошибка сети',
        severity: 'error' 
      });
    } finally {
      setEditingField(null);
    }
  };

  // Обработчик отмены редактирования
  const handleCancel = () => {
    setEditingField(null);
  };

  /**
   * Вспомогательная функция для рендеринга поля профиля
   * @param {string} label - Отображаемое название поля
   * @param {string} field - Ключ поля в объекте user
   * @returns {JSX.Element} - React-элемент поля
   */
  const renderField = (label, field) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography variant="subtitle1" sx={{ width: 150 }}>{label}:</Typography>
      
      {editingField === field ? (
        <>
          <TextField
            size="small"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <IconButton onClick={() => handleSave(field)} color="primary">
            <SaveIcon />
          </IconButton>
          <Button onClick={handleCancel}>Отмена</Button>
        </>
      ) : (
        <>
          <Typography sx={{ flexGrow: 1 }}>{user[field] || 'Не указано'}</Typography>
          <IconButton onClick={() => handleEdit(field)}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </Box>
  );

  // Основной рендер компонента
  return (
    <div className="dashboard-page">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Личный кабинет
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Профиль пользователя</Typography>
          
          {renderField('Фамилия', 'lastName')}
          {renderField('Имя', 'firstName')}
          {renderField('Email', 'email')}
          {renderField('Дата рождения', 'birthDate')}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;