import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeMenu, setActiveMenu] = React.useState(null);

  const handleMenuOpen = (event, menuName) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(menuName);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const menuItems = {
    company: {
      name: 'Компания',
      path: '/company',
      children: [
        { name: 'О компании', path: '/about' },
        { name: 'Команда', path: '/team' },
        { name: 'Миссия', path: '/mission' },
        { name: 'Контакты', path: '/contacts' },
      ],
    },
    services: {
      name: 'Сервисы',
      path: '/services',
      children: [
        { name: 'Bannikoff', path: '/bannikoff' },
        { name: 'Замечания Moex', path: '/moex-notes' },
      ],
    },
    offerings: {
      name: 'Услуги',
      path: '/offerings',
      children: [
        { name: 'Разработка сайтов', path: '/web-dev' },
        { name: 'Разработка приложений', path: '/app-dev' },
        { name: 'Управление проектом', path: '/project-management' },
        { name: 'Консалтинг', path: '/consulting' },
      ],
    },
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        color: 'black',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)', // Добавляем линию
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)', // Тень для разделения
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Логотип */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          Survee
        </Typography>

        {/* Центральное меню */}
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {Object.keys(menuItems).map((menuKey) => (
            <div key={menuKey}>
              <Button
                color="inherit"
                onClick={(e) => handleMenuOpen(e, menuKey)}
                sx={{ textTransform: 'capitalize' }}
              >
                {menuItems[menuKey].name}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={activeMenu === menuKey}
                onClose={handleMenuClose}
              >
                {menuItems[menuKey].children.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={Link}
                    to={item.path}
                    onClick={handleMenuClose}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          ))}
        </Box>

        {/* Личный кабинет */}
        <Button
          color="inherit"
          component={Link}
          to="/login"
          sx={{ textTransform: 'none' }}
        >
          Личный кабинет
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
