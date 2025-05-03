// src/styles/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Синий цвет MUI по умолчанию
    },
    secondary: {
      main: '#dc004e', // Розовый цвет MUI по умолчанию
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    // Другие настройки типографики...
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Отключаем автоматическое преобразование к верхнему регистру
        },
      },
    },
    // Другие кастомизации компонентов...
  },
});