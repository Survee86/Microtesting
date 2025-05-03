import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const menuStructure = {
  '/about':               { parent: '/company',   name: 'О компании' },
  '/team':                { parent: '/company',   name: 'Команда' },
  '/mission':             { parent: '/company',   name: 'Миссия' },
  '/contacts':            { parent: '/company',   name: 'Контакты' },
  '/bannikoff':           { parent: '/services',  name: 'Bannikoff' },
  '/moex-notes':          { parent: '/services',  name: 'Замечания Moex' },
  '/web-dev':             { parent: '/offerings', name: 'Разработка сайтов' },
  '/app-dev':             { parent: '/offerings', name: 'Разработка приложений' },
  '/project-management':  { parent: '/offerings', name: 'Управление проектом' },
  '/consulting':          { parent: '/offerings', name: 'Консалтинг' },
  '/company':             { parent: '/',          name: 'Компания' },
  '/services':            { parent: '/',          name: 'Сервисы' },
  '/offerings':           { parent: '/',          name: 'Услуги' },
  '/auth':                { parent: '/',          name: 'Авторизация' },
  '/register':            { parent: '/',          name: 'Регистрация' }
};

export const AppBreadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

    // Скрываем для страниц авторизации
    if (['/', '/register', '/login'].includes(currentPath)) {
      return null;
    }

  const buildPath = () => {
    const items = [];
    let current = currentPath;
    
    while (current && current !== '/') {
      if (menuStructure[current]) {
        items.unshift({
          path: current,
          name: menuStructure[current].name
        });
        current = menuStructure[current].parent;
      } else {
        break;
      }
    }
    
    return items;
  };

  const pathItems = buildPath();

  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      px: 2,
      py: 1.5,
      backgroundColor: '#f8f9fa',
      borderRadius: 1,
      mb: 2
    }}>
      <MuiBreadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link 
          to="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Главная
        </Link>

        {pathItems.map((item, index) => (
          index === pathItems.length - 1 ? (
            <Typography key={item.path} color="text.primary">
              {item.name}
            </Typography>
          ) : (
            <Link 
              key={item.path} 
              to={item.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {item.name}
            </Link>
          )
        ))}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default AppBreadcrumbs;