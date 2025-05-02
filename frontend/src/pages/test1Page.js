import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const DropdownMenu = () => {
  // Состояния для якорей меню
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  // Открытые/закрытые состояния меню
  const [productsOpen, setProductsOpen] = useState(null);
  const [servicesOpen, setServicesOpen] = useState(null);
  const [companyOpen, setCompanyOpen] = useState(null);

  // Обработчики для десктопного меню
  const handleOpenMenu = (event, setter) => {
    setter(event.currentTarget);
  };

  const handleCloseMenu = (setter) => {
    setter(null);
  };

  // Обработчики для мобильного меню
  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  // Пункты меню
  const menuItems = [
    {
      name: 'Продукты',
      state: productsOpen,
      setter: setProductsOpen,
      items: ['Продукт 1', 'Продукт 2', 'Продукт 3'],
    },
    {
      name: 'Услуги',
      state: servicesOpen,
      setter: setServicesOpen,
      items: ['Услуга 1', 'Услуга 2', 'Услуга 3'],
    },
    {
      name: 'Компания',
      state: companyOpen,
      setter: setCompanyOpen,
      items: ['О нас', 'Команда', 'Контакты'],
    },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Логотип или название */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Мое приложение
        </Typography>

        {/* Десктопное меню - скрывается на мобильных */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {menuItems.map((item) => (
            <Box key={item.name}>
              <Button
                color="inherit"
                onClick={(e) => handleOpenMenu(e, item.setter)}
                aria-controls={`${item.name}-menu`}
                aria-haspopup="true"
              >
                {item.name}
              </Button>
              <Menu
                id={`${item.name}-menu`}
                anchorEl={item.state}
                open={Boolean(item.state)}
                onClose={() => handleCloseMenu(item.setter)}
                MenuListProps={{
                  'aria-labelledby': `${item.name}-button`,
                }}
              >
                {item.items.map((subItem) => (
                  <MenuItem
                    key={subItem}
                    onClick={() => handleCloseMenu(item.setter)}
                  >
                    {subItem}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ))}
        </Box>

        {/* Мобильное меню - появляется только на мобильных */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="меню приложения"
            aria-controls="mobile-menu"
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-menu"
            anchorEl={mobileAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(mobileAnchorEl)}
            onClose={handleMobileMenuClose}
          >
            {menuItems.map((item) => (
              <MenuItem key={item.name} onClick={handleMobileMenuClose}>
                <Typography textAlign="center">{item.name}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DropdownMenu;
