const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/auth.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Ruta protegida (cualquier usuario autenticado)
router.get('/perfil', authMiddleware, (req, res) => {
  res.json({ message: 'Perfil de usuario', user: req.user });
});

// Ruta protegida solo para admins
router.get('/admin', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ message: 'Panel de administración' });
});

module.exports = router;