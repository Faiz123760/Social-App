import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Container
} from '@mui/material';
import { AccountCircle, AddCircle, Home, Logout } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
          <Typography
            variant="h6"
            component={Link}
            to="/feed"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { opacity: 0.9 }
            }}
          >
            SocialHub
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton component={Link} to="/feed" color="inherit" sx={{ color: 'white' }}>
              <Home />
            </IconButton>
            <IconButton component={Link} to="/create" color="inherit" sx={{ color: 'white' }}>
              <AddCircle />
            </IconButton>

            <IconButton onClick={handleMenu} color="inherit">
              {user?.username ? (
                <Avatar sx={{ bgcolor: '#764ba2', width: 32, height: 32 }}>
                  {user.username[0].toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2">Hi, {user?.username}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;