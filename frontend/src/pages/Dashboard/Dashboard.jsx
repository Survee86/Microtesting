// Импорт необходимых модулей из React и сторонних библиотек
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  Button, 
  Snackbar, 
  Alert, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Popover
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import axios from 'axios';
import './Dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Основной компонент Dashboard
const Dashboard = () => {
  // Состояния для данных пользователя и опросов
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: ''
  });

  const [surveys, setSurveys] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [snackbar, setSnackbar] = useState({ 
    open: false,
    message: '',
    severity: 'success'
  });

  // Состояния для формы создания опроса
  const [surveyFormOpen, setSurveyFormOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [surveyData, setSurveyData] = useState({
    name: '',
    description: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    visibility: 'Открытый',
    linkType: 'Многоразовая',
    participants: [],
    questions: []
  });

  // Состояния для управления всплывающими меню
  const [excelMenuAnchor, setExcelMenuAnchor] = useState(null);
  const [excelMenuType, setExcelMenuType] = useState('');

  // Функция для выполнения запросов с обновлением токена
  const fetchWithRefresh = async (url, options = {}) => {
    try {
      return await axios(url, options);
    } catch (error) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('token', data.token);
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${data.token}`
            }
          };
          return await axios(url, newOptions);
        } catch (refreshError) {
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
      throw error;
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSnackbar({
            open: true,
            message: 'Требуется авторизация. Пожалуйста, войдите в систему',
            severity: 'error'
          });
          return;
        }
        
        const authHeader = { Authorization: `Bearer ${token}` };
        const [userResponse, surveysResponse] = await Promise.all([
          fetchWithRefresh('/api/user', { headers: authHeader }),
          fetchWithRefresh('/api/surveys/read', { headers: authHeader })
        ]);

        setUser(userResponse.data);
        if (surveysResponse.data && surveysResponse.data.length > 0) {
          setSurveys(surveysResponse.data);
        }
      } catch (error) {
        console.error('[Ошибка]', error.response?.data || error.message);
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

    fetchUserData();
  }, []);

  // Обработчики для формы профиля
  const handleEdit = (field) => {
    setEditingField(field);
    setTempValue(user[field]);
  };

  const handleSave = async (field) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      await fetchWithRefresh('/api/user', {
        method: 'PATCH',
        data: { [field]: tempValue },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      setUser(prev => ({ ...prev, [field]: tempValue }));
      setSnackbar({ open: true, message: 'Данные сохранены!', severity: 'success' });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || 'Ошибка сети',
        severity: 'error' 
      });
    } finally {
      setEditingField(null);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  // Обработчики для формы опроса
  const handleAddSurvey = () => {
    setSurveyFormOpen(true);
  };

  const handleCloseSurveyForm = () => {
    setConfirmClose(true);
  };

  const handleConfirmClose = (confirm) => {
    setConfirmClose(false);
    if (confirm) {
      setSurveyFormOpen(false);
      setSurveyData({
        name: '',
        description: '',
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        visibility: 'Открытый',
        linkType: 'Многоразовая',
        participants: [],
        questions: []
      });
    }
  };

  const handleSurveyChange = (field, value) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSurvey = () => {
    console.log('Сохранение опроса:', surveyData);
    setSnackbar({
      open: true,
      message: 'Опрос успешно сохранен',
      severity: 'success'
    });
    setSurveyFormOpen(false);
  };

  // Обработчики для таблицы участников
  const addParticipant = () => {
    setSurveyData(prev => ({
      ...prev,
      participants: [...prev.participants, {
        lastName: '',
        firstName: '',
        middleName: '',
        email: ''
      }]
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...surveyData.participants];
    updatedParticipants[index][field] = value;
    setSurveyData(prev => ({
      ...prev,
      participants: updatedParticipants
    }));
  };

  // Обработчики для таблицы вопросов
  const addQuestion = () => {
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        number: prev.questions.length + 1,
        text: '',
        answerType: 'один вариант',
        image: null
      }]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...surveyData.questions];
    updatedQuestions[index][field] = value;
    setSurveyData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  // Обработчики для Excel меню
  const handleExcelMenuClick = (event, type) => {
    setExcelMenuAnchor(event.currentTarget);
    setExcelMenuType(type);
  };

  const handleExcelMenuClose = () => {
    setExcelMenuAnchor(null);
  };

  const handleExcelAction = (action) => {
    console.log(`${action} для ${excelMenuType}`);
    handleExcelMenuClose();
    setSnackbar({
      open: true,
      message: `Функция "${action}" для ${excelMenuType} будет реализована позже`,
      severity: 'info'
    });
  };

  // Вспомогательные функции рендеринга
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

  const renderSurveysBlock = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Опросы</Typography>
        <IconButton 
          onClick={handleAddSurvey}
          sx={{ 
            backgroundColor: '#4caf50',
            color: 'white',
            '&:hover': {
              backgroundColor: '#388e3c',
            }
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      {surveys.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          У вас пока нет созданных опросов
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="таблица опросов">
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Наименование</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Видимость</TableCell>
                <TableCell>Отправлено</TableCell>
                <TableCell>Пройдено</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surveys.map((survey, index) => (
                <TableRow key={survey.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{survey.title}</TableCell>
                  <TableCell>{survey.author || 'Вы'}</TableCell>
                  <TableCell>{survey.status}</TableCell>
                  <TableCell>{survey.visibility}</TableCell>
                  <TableCell>{survey.sentCount || 0}</TableCell>
                  <TableCell>{survey.completedCount || 0}</TableCell>
                  <TableCell>
                    <IconButton aria-label="редактировать" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="просмотреть" size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  // Рендер формы создания опроса
  const renderSurveyForm = () => (
    <Dialog
      open={surveyFormOpen}
      onClose={handleCloseSurveyForm}
      fullScreen
      sx={{ 
        '& .MuiDialog-container': {
          alignItems: 'flex-start'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6">Создание нового опроса</Typography>
        <Box>
          <IconButton onClick={() => console.log('Свернуть')}>
            <MinimizeIcon />
          </IconButton>
          <IconButton onClick={handleCloseSurveyForm}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Блок реквизитов опроса */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Реквизиты опроса</Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Наименование опроса"
              value={surveyData.name}
              onChange={(e) => handleSurveyChange('name', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Краткое описание опроса"
              value={surveyData.description}
              onChange={(e) => handleSurveyChange('description', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <InputLabel shrink>Дата начала опроса</InputLabel>
                <DatePicker
                  selected={surveyData.startDate}
                  onChange={(date) => handleSurveyChange('startDate', date)}
                  customInput={
                    <TextField
                      fullWidth
                      size="small"
                    />
                  }
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <InputLabel shrink>Время начала опроса</InputLabel>
                <DatePicker
                  selected={surveyData.startTime}
                  onChange={(time) => handleSurveyChange('startTime', time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  customInput={
                    <TextField
                      fullWidth
                      size="small"
                    />
                  }
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <InputLabel shrink>Дата завершения опроса</InputLabel>
                <DatePicker
                  selected={surveyData.endDate}
                  onChange={(date) => handleSurveyChange('endDate', date)}
                  customInput={
                    <TextField
                      fullWidth
                      size="small"
                    />
                  }
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <InputLabel shrink>Время завершения опроса</InputLabel>
                <DatePicker
                  selected={surveyData.endTime}
                  onChange={(time) => handleSurveyChange('endTime', time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  customInput={
                    <TextField
                      fullWidth
                      size="small"
                    />
                  }
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Видимость опроса</InputLabel>
                <Select
                  value={surveyData.visibility}
                  onChange={(e) => handleSurveyChange('visibility', e.target.value)}
                  input={<OutlinedInput label="Видимость опроса" />}
                >
                  <MenuItem value="Открытый">Открытый</MenuItem>
                  <MenuItem value="Закрытый">Закрытый</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Тип ссылки</InputLabel>
                <Select
                  value={surveyData.linkType}
                  onChange={(e) => handleSurveyChange('linkType', e.target.value)}
                  input={<OutlinedInput label="Тип ссылки" />}
                >
                  <MenuItem value="Единоразовая">Единоразовая</MenuItem>
                  <MenuItem value="Многоразовая">Многоразовая</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
        
        {/* Блок участников опроса */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Участники опроса</Typography>
            <Box>
              <IconButton 
                onClick={addParticipant}
                sx={{ 
                  backgroundColor: '#4caf50',
                  color: 'white',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: '#388e3c',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
              
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => handleExcelMenuClick(e, 'participants')}
              >
                Загрузить из Excel
              </Button>
            </Box>
          </Box>
          
          {surveyData.participants.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Фамилия</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Отчество</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveyData.participants.map((participant, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={participant.lastName}
                          onChange={(e) => handleParticipantChange(index, 'lastName', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={participant.firstName}
                          onChange={(e) => handleParticipantChange(index, 'firstName', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={participant.middleName}
                          onChange={(e) => handleParticipantChange(index, 'middleName', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={participant.email}
                          onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Добавьте участников опроса
            </Typography>
          )}
        </Paper>
        
        {/* Блок вопросов */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>Вопросы</Typography>
            <Box>
              <IconButton 
                onClick={addQuestion}
                sx={{ 
                  backgroundColor: '#4caf50',
                  color: 'white',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: '#388e3c',
                  }
                }}
              >
                <AddIcon />
              </IconButton>
              
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => handleExcelMenuClick(e, 'questions')}
              >
                Загрузить из Excel
              </Button>
            </Box>
          </Box>
          
          {surveyData.questions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Текст вопроса</TableCell>
                    <TableCell>Тип ответа</TableCell>
                    <TableCell>Изображение</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveyData.questions.map((question, index) => (
                    <TableRow key={index}>
                      <TableCell>{question.number}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={question.answerType}
                            onChange={(e) => handleQuestionChange(index, 'answerType', e.target.value)}
                          >
                            <MenuItem value="один вариант">Один вариант</MenuItem>
                            <MenuItem value="несколько вариантов">Несколько вариантов</MenuItem>
                            <MenuItem value="текстовое поле">Текстовое поле</MenuItem>
                            <MenuItem value="шкала от 0 до 10">Шкала от 0 до 10</MenuItem>
                            <MenuItem value="набор смайлов">Набор смайлов</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                        >
                          Загрузить
                          <input
                            type="file"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleQuestionChange(index, 'image', file);
                              }
                            }}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Добавьте вопросы для опроса
            </Typography>
          )}
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          variant="contained" 
          onClick={handleSaveSurvey}
          sx={{ mr: 2 }}
        >
          Сохранить
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleCloseSurveyForm}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Рендер меню для Excel
  const renderExcelMenu = () => (
    <Popover
      open={Boolean(excelMenuAnchor)}
      anchorEl={excelMenuAnchor}
      onClose={handleExcelMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 1 }}>
        <MenuItem onClick={() => handleExcelAction('Загрузить список')}>Загрузить список</MenuItem>
        <MenuItem onClick={() => handleExcelAction('Скачать шаблон')}>Скачать шаблон</MenuItem>
      </Box>
    </Popover>
  );

  // Рендер диалога подтверждения закрытия
  const renderConfirmDialog = () => (
    <Dialog
      open={confirmClose}
      onClose={() => handleConfirmClose(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Подтверждение</DialogTitle>
      <DialogContent>
        <Typography>Вы уверены, что хотите закрыть форму? Все несохраненные данные будут потеряны.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleConfirmClose(false)}>Отмена</Button>
        <Button onClick={() => handleConfirmClose(true)} color="primary">Закрыть</Button>
      </DialogActions>
    </Dialog>
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

        {renderSurveysBlock()}
      </Box>

      {/* Форма создания опроса */}
      {renderSurveyForm()}
      
      {/* Вспомогательные компоненты */}
      {renderExcelMenu()}
      {renderConfirmDialog()}

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