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

  // Эффект для загрузки данных пользователя при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для получения данных пользователя
    const fetchUserData = async () => {
      try {
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        
        // Параллельно выполняем два запроса:
        // 1. Запрос основных данных пользователя
        // 2. Запрос данных профиля
        const [userResponse, profileResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/user', {
            headers: { Authorization: `Bearer ${token}` } // Передаем токен в заголовке
          }),
          axios.get('http://localhost:3001/api/profile', {
            headers: { Authorization: `Bearer ${token}` } // Передаем токен в заголовке
          })
        ]);
        
        // Объединяем полученные данные и сохраняем в состояние
        setUser({
          ...userResponse.data, // Данные из /api/user
          ...profileResponse.data // Данные из /api/profile
        });
      } catch (error) {
        // Обработка ошибок при загрузке данных
        console.error('Ошибка загрузки данных:', error);
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
      // Получаем токен из localStorage
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      // Отправляем PATCH-запрос на сервер для обновления данных
      const response = await axios({
        method: 'PATCH', // Метод запроса
        url: '/api/user', // Эндпоинт
        data: { [field]: tempValue }, // Данные для обновления (поле и новое значение)
        headers: {
          'Authorization': `Bearer ${token}`, // Токен авторизации
          'Content-Type': 'application/json' // Тип содержимого
        },
        withCredentials: true // Использовать credentials
      });

      // При успешном ответе:
      // 1. Обновляем состояние пользователя
      setUser(prev => ({ ...prev, [field]: tempValue }));
      // 2. Показываем уведомление об успехе
      setSnackbar({ open: true, message: 'Данные сохранены!', severity: 'success' });
    } catch (error) {
      // При ошибке:
      // 1. Логируем полную информацию об ошибке
      console.error('Полная ошибка:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      
      // 2. Показываем уведомление с ошибкой
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || 'Ошибка сети',
        severity: 'error' 
      });
    } finally {
      // В любом случае завершаем редактирование
      setEditingField(null);
    }
  };

  // Обработчик отмены редактирования
  const handleCancel = () => {
    setEditingField(null); // Просто сбрасываем поле редактирования
  };

  // Вспомогательная функция для рендеринга поля
  const renderField = (label, field) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {/* Лейбл поля */}
      <Typography variant="subtitle1" sx={{ width: 150 }}>{label}:</Typography>
      
      {/* Если поле в режиме редактирования */}
      {editingField === field ? (
        <>
          {/* Поле ввода */}
          <TextField
            size="small"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)} // Обновляем временное значение
            sx={{ flexGrow: 1 }}
          />
          {/* Кнопка сохранения */}
          <IconButton onClick={() => handleSave(field)} color="primary">
            <SaveIcon />
          </IconButton>
          {/* Кнопка отмены */}
          <Button onClick={handleCancel}>Отмена</Button>
        </>
      ) : (
        <>
          {/* Отображение значения поля */}
          <Typography sx={{ flexGrow: 1 }}>{user[field] || 'Не указано'}</Typography>
          {/* Кнопка редактирования */}
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
      {/* Основной контейнер */}
      <Box sx={{ p: 3 }}>
        {/* Заголовок страницы */}
        <Typography variant="h4" gutterBottom>
          Личный кабинет
        </Typography>
        
        {/* Карточка с профилем пользователя */}
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          {/* Заголовок карточки */}
          <Typography variant="h6" gutterBottom>Профиль пользователя</Typography>
          
          {/* Рендер полей профиля */}
          {renderField('Фамилия', 'lastName')}
          {renderField('Имя', 'firstName')}
          {renderField('Email', 'email')}
          {renderField('Дата рождения', 'birthDate')}
        </Paper>
      </Box>

      {/* Компонент для показа уведомлений */}
      <Snackbar
        open={snackbar.open} // Контроль видимости
        autoHideDuration={6000} // Время автоматического закрытия (6 сек)
        onClose={() => setSnackbar({ ...snackbar, open: false })} // Обработчик закрытия
      >
        {/* Текст уведомления с типом (success/error и т.д.) */}
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;